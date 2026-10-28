# Hardware, Parallelism, and Concurrency

Part of the advanced techniques. The shared rules in `ADVANCED-TECHNIQUES.md` apply to every table in this file; read them first. Tables are read as described there.

## Memory locality

Select these only when profiling, cache-miss counters, branch-miss counters, or benchmarks show memory access or the hardware pipeline is the bottleneck. Apart from sparse representations, asymptotic complexity does not change; constant factors can change by several times.

| Signal | Technique | Valid when | Typical result |
|---|---|---|---|
| Hot loops read one field from many objects (pointer chasing, scattered allocations) | Data-oriented layout: structure of arrays (SoA) instead of array of structures (AoS); flat primitive arrays | Callers do not depend on object identity or the object API, or an adapter keeps it | Fewer cache misses; vectorization becomes possible |
| Linked structures traversed in hot paths | Contiguous arrays, index-based links, arena or pool allocation | — | Sequential access instead of pointer chasing |
| Nested loops over large 2D data (matrix multiply, image filters, grid passes) | Loop interchange to match memory order; loop tiling/blocking | Reordering does not change results (floating-point summation order is a behavior change) | Working set fits in cache |
| Threads updating counters or fields that share a cache line | Padding or per-thread accumulators combined at the end (avoid false sharing) | Combining preserves the original result | Removes cache-line contention |
| Many short-lived allocations in hot code | Allocation reduction: reuse buffers, preallocate, pooling | Reused objects are never retained by callers or other threads | Less GC and allocator time |
| Throughput limited by bytes moved, not computation | Compact representations (smaller integer types, bit packing, compression of cold data) | Value ranges are proven to fit | Less memory bandwidth |
| Data that is mostly zeros or one repeated value | Sparse representation (sorted index-value pairs, hash map of non-default entries, CSR) instead of dense, or the reverse when density is high | Density measured on real data; the default value is reported the same way | Memory and time proportional to non-default entries; dense wins above a measured density |
| Binary search over a large static sorted array | Eytzinger (breadth-first) layout with prefetching, or a static B-tree layout | Data does not change between searches; results identical, including which duplicate is returned | Same O(log n); far fewer cache misses |
| Divide-and-conquer over large data on hardware with unknown or several cache levels | Cache-oblivious algorithms and layouts: recursive matrix transpose and multiply, van Emde Boas layout for static trees, funnel sort | Results identical (floating-point summation order is a behavior change) | Near-optimal cache misses at every level without tuning to a cache size |
| Code tuned to one cache size (tile size, block size) | Cache-aware blocking with the size measured or queried on the target | Target hardware is known | Better constants than cache-oblivious on that hardware; worse on others |
| Unpredictable branches in a hot loop (comparisons on random data, filters) | Branchless code: conditional moves, masks, arithmetic selection | Profile shows branch mispredictions; results identical | Constant factor; often slower when the branch is predictable, so measure on real data |
| Choice between an asymptotically better and a simpler structure at small sizes (linear scan versus hash lookup, insertion sort versus merge sort) | Measured crossover threshold, with the simple method below it | Threshold measured on the target hardware and data; both paths give identical results | Faster at small n without losing the asymptotic bound at large n |

## Parallelism and vectorization

Parallelism reduces wall-clock time, not total work, and adds overhead. Use it only after the sequential algorithm is optimal.

- **Amdahl's law.** If a fraction p of the work can run in parallel on N cores, the best possible speedup is 1 / ((1 − p) + p / N). Estimate p from a profile before proposing parallelism.
- **Overhead.** Task scheduling, thread creation, synchronization, and data transfer cost time. Small inputs often get slower. Benchmark at realistic sizes and find the size below which sequential execution wins.
- **Load imbalance.** Uneven chunks leave cores idle; use work stealing or smaller chunks.
- **Determinism.** Parallel floating-point reductions change summation order and therefore results. Order of side effects, logging, and errors changes. All of these are behavior changes that need developer review.
- **Changing threading is a contract change** (rule 11).

| Signal | Technique | Valid when | Typical result |
|---|---|---|---|
| Independent per-element work over large arrays | SIMD/vectorized operations: compiler auto-vectorization, platform vector APIs, vectorized libraries | Simple loops without data-dependent branches; results identical (beware floating-point reassociation) | Several times faster per core |
| Large independent tasks or data partitions | Task or data parallelism with a bounded thread pool | Tasks are truly independent; shared state is synchronized or eliminated | Up to the Amdahl limit |
| Associative reductions over large data | Parallel reduction with per-thread partial results | The operation is associative; for floating point, results differ (behavior change) unless a deterministic reduction order is used | Up to the Amdahl limit |
| Pipelines of independent stages | Pipelining with bounded queues | Stage order and backpressure preserve semantics | Overlaps I/O and compute |

### Contention and synchronization

On multicore systems, threads waiting on the same lock, atomic variable, or cache line can cost more than the work itself, and adding cores makes it worse. Select these only when a profile shows lock wait time, contended atomics, or cache-line transfers. Differential tests cannot cover thread interleavings: unless a stress test, a race detector (ThreadSanitizer or the platform's equivalent), or a model checker covers the change, it is unverified equivalence and needs the developer's approval with a `NEEDS-TESTING` marker (rule 5). Changing what a caller may observe about threading or atomicity is a contract change (rule 11).

| Signal | Technique | Valid when | Typical result |
|---|---|---|---|
| Many threads update one shared counter or statistic | Per-thread or per-CPU counters summed when read (striped counters, such as Java's `LongAdder`) | Readers accept a sum that is not an atomic snapshot of all updates; behavior change if any reader needs the exact instantaneous value | Updates no longer contend; a read costs O(threads) |
| One lock guards a large map or table, and profiles show contention on it | Lock striping: split into shards selected by key hash, one lock per shard | Each operation touches one shard, or multi-shard operations take shard locks in one fixed order | Contention divided by about the shard count |
| Data read far more often than written, with readers serialized by a lock | Reader-writer lock; or read-copy-update (RCU) or copy-on-write snapshots, where writers publish a new version and readers take no lock | Readers tolerate seeing the previous version until their read finishes (otherwise behavior change); old versions are freed only after every reader that may hold them has finished | Reads proceed in parallel without lock acquisition; writes pay a copy |
| Lock held during slow work (I/O, allocation, logging, callbacks) | Shrink the critical section: prepare outside the lock, hold it only to publish | Every invariant the lock protects still holds whenever another thread can observe the data | Less waiting; same total work |
| Single producer and single consumer exchanging items through a locked queue | Lock-free bounded ring buffer with acquire and release memory ordering | Exactly one producer thread and one consumer thread; memory ordering correct on every target architecture; behavior when full (block, drop, or fail) matches the original | No lock per item |
| Several threads updating fields on the same cache line | See the false-sharing row (padding or per-thread accumulators) under "Memory locality" | — | — |

General lock-free and wait-free structures (multi-producer queues, lock-free hash maps) are subtle and easy to get wrong: prefer the platform's own concurrent structures, or a reviewed library with the developer's permission (rule 7).
