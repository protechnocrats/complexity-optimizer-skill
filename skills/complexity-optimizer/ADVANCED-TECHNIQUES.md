# Advanced Techniques

Load this file in Phase 3 alongside `ALGORITHM-ARSENAL.md` when:

- the core techniques do not reach the lower bound, or
- the problem is about graphs (static or changing), trees, dynamic programming, combinatorial search, strings, number theory, numerical computation, memory locality, parallelism and vectorization, lock contention, streaming and external memory, hash table design, storage and indexing, spatial data, caching and eviction, or specialized data structures.

Read the tables the same way as in `ALGORITHM-ARSENAL.md`: build or preprocessing cost is stated separately from per-query cost, output cost counts, bounds are worst case unless labeled, and "in practice" marks workload-dependent speedups.

These techniques apply to any codebase: operating system kernels, storage and database engines, file systems, compilers, search engines, scientific and financial code, games, infrastructure tooling, backends, and apps. Every rule still applies. In particular:

- **Assumptions decide validity.** Each technique below has strict preconditions. Confirm each one from the code and record the evidence.
- **Most need an implementation inside the project.** Standard libraries rarely include them. Write a focused implementation with its own tests (see "Testing a new data structure" in `DIFFERENTIAL-TESTING.md`) and a comment naming the technique and its complexity (rule 13). If a well-tested library is the better route, ask first (rule 7).
- **Approximate results are always behavior changes.** Any technique whose answer can differ from the exact answer callers receive today (sketches, sampling, approximate nearest neighbor, probabilistic primality tests without a deterministic base set) needs developer review (rule 5). Randomized or probabilistic techniques whose final answer stays exact are not behavior changes on that account: a Bloom or cuckoo filter followed by the exact check, a hash match confirmed by direct comparison, randomized quickselect. Their randomness affects only running time; label those bounds as expected.
- **Constant factors matter.** Several techniques win only at large sizes. Benchmark at realistic sizes (rule 8).
- **A behavior change is a decision, not a disqualification.** When the best technique changes results (more accurate floating-point sums, a different eviction order, approximate answers), still report it with the exact behavior before and after, and let the developer decide (rule 5). Offer the best equivalent alternative next to it.

## Graphs

| Signal | Technique | Valid when | Typical result |
|---|---|---|---|
| Shortest paths with negative edge weights | Bellman-Ford | No negative cycles reachable, or the code must detect them (Bellman-Ford can) | Handles cases Dijkstra cannot; O(V·E) |
| All-pairs shortest paths, negative edges, sparse graph | Johnson's algorithm (Bellman-Ford reweighting + Dijkstra from each node) | No negative cycles | O(V·E log V) |
| All-pairs shortest paths on a small or dense graph | Floyd-Warshall | Replaces V separate single-source runs; wins when E is close to V² or V is small | O(V³), simple, cache-friendly |
| Path search in a very large state space with a good estimate of remaining cost | A* | The heuristic is admissible (never overestimates) for optimal paths; consistent to avoid reopening nodes | Explores far fewer states than Dijkstra in practice; same worst case |
| Path between two known endpoints in a huge, uniform search space | Bidirectional BFS | Edges can be traversed backward | O(b^d) → O(b^(d/2)) for branching factor b and depth d |
| Strongly connected components, condensing cycles | Tarjan or Kosaraju | — | O(V + E) |
| Critical links or single points of failure | Bridges and articulation points via low-link DFS | Undirected graph | O(V + E) |
| Longest path or DP over dependencies | DP in topological order | Graph is a DAG | Exponential path enumeration → O(V + E) |
| Two-coloring, conflict detection | Bipartite check with BFS coloring | — | O(V + E) |
| Assignment and matching problems | Hopcroft-Karp (bipartite matching); Dinic or Edmonds-Karp (max flow) | Problem reduces to flow or bipartite matching | Brute force → O(E√V) for matching; O(V²·E) Dinic |
| Many distance or ancestor queries on a tree | Lowest common ancestor via binary lifting, or Euler tour + range-minimum query | Tree does not change between queries | O(n) per query → O(log n), or O(1) with Euler tour + sparse table, after preprocessing |
| Connectivity that changes offline with threshold queries | Sort edges and queries + union-find | All queries known up front | Repeated traversal → O((E + Q) log(E + Q)) |

### Changing graphs

A static-graph algorithm rerun after every change costs its full price per change. When edges or nodes change often between queries (build systems, package managers, schedulers, lock-order checkers, incremental compilers), count the total cost over the sequence of changes.

| Signal | Technique | Valid when | Typical result |
|---|---|---|---|
| Topological order recomputed after each added edge | Incremental topological ordering (Pearce-Kelly, or Bender-Fineman-Gilbert-Tarjan) | Edges are mostly added; a new edge that closes a cycle is detected and reported the same way the original reports it | O(V + E) re-sort per insertion → work proportional to the region of the order that must shift, in practice; worst case per insertion is no better than re-sorting |
| Unions that must be undone in last-in, first-out order (backtracking search, versioned state) | Union-find with rollback: union by rank or size, **no** path compression, a stack of changes | Undo order is last-in, first-out | Rebuild per undo → O(log n) per union, find, and undo |
| Connectivity queries interleaved with edge additions and deletions, all known up front | Offline dynamic connectivity: segment tree over time, each edge inserted into the intervals where it exists, DFS with rollback union-find | All operations known in advance | O(V + E) per query → O((E + Q) log Q log V) total |
| Connectivity queries with online edge additions and deletions | Fully dynamic connectivity (Holm-de Lichtenberg-Thorup) | Large, subtle implementation: prefer a reviewed library and ask (rule 7) | O(V + E) per query → O(log² V) amortized per update, O(log V / log log V) per query |
| Derived values or reachability over a dependency graph, recomputed in full after a small change | Incremental recomputation: mark changed nodes dirty, recompute only nodes reachable from them, in topological order; stop propagating when a recomputed value is unchanged (early cutoff) | Every dependency edge is tracked; each node's computation is pure | O(V + E) per change → proportional to the affected subgraph |

## Trees

| Signal | Technique | Valid when | Typical result |
|---|---|---|---|
| Subtree sums, counts, or updates | Euler tour (flatten the tree to a range) + Fenwick or segment tree | — | O(subtree size) per query → O(log n) |
| An answer computed for every possible root | Tree DP with rerooting | The per-root answer can be combined from child and parent contributions | O(n²) → O(n) |
| Path queries and updates between arbitrary nodes | Heavy-light decomposition + segment tree | Tree shape does not change | O(n) per query → O(log² n) |
| Distance-based counting over all pairs of nodes | Centroid decomposition | — | O(n²) → O(n log n) or O(n log² n) |

## Sequences and ranges

| Signal | Technique | Valid when | Typical result |
|---|---|---|---|
| Many offline range queries with no updates, where adding or removing one element updates the answer cheaply | Mo's algorithm | All queries known up front; add/remove are O(1) | O(n·q) → O((n + q)·√n) |
| Range queries and updates with a structure too complex for a segment tree | Square-root decomposition | — | O(n) per operation → O(√n) |
| Queries against past versions of an array | Persistent segment tree | — | Copying per version → O(log n) per update and query |
| Counting inversions | Merge sort with counting | — | O(n²) → O(n log n) |

## Dynamic programming optimizations

| Signal | Technique | Valid when | Typical result |
|---|---|---|---|
| DP transition takes the min/max over a sliding range of previous states | Monotonic deque | The range of candidate states slides monotonically | O(n·k) → O(n) amortized total |
| Transition minimizes a linear function of earlier states (dp[j] + a[i]·b[j]) | Convex hull trick or Li Chao tree | The transition has that exact linear form | O(n²) → O(n log n), or O(n) with monotonic slopes and queries |
| Optimal split point moves monotonically as i grows | Divide-and-conquer optimization | Monotonicity of the optimal split point is proven | O(k·n²) → O(k·n log n) |
| Interval DP where cost satisfies the quadrangle inequality | Knuth optimization | Quadrangle inequality and monotonicity hold | O(n³) → O(n²) |
| Optimal segmentation or partitioning | Interval DP, partition DP, prefix DP | — | Exhaustive partition enumeration → O(states × transitions per state), often O(n²) or O(n³) |
| Counts or properties of every number in a huge range, digit by digit | Digit DP | Property decomposes over digits | O(range) → O(digits · states) |
| Aggregating over all subsets of each mask | Sum over subsets (SOS) DP | — | O(3^n) → O(n·2^n) |

## Combinatorial search

| Signal | Technique | Valid when | Typical result |
|---|---|---|---|
| Subset search with n roughly 30 to 45 | Meet-in-the-middle with sorting or hashing | The problem splits into two halves whose results combine | O(2^n) → roughly O(2^(n/2) · n) |
| Search with a strong bound on the best possible remaining result | Branch and bound | The bound is valid (never prunes the optimum) | Large practical speedups; worst case exponential |
| Constraint satisfaction (scheduling, configuration, puzzles) | Constraint propagation with backtracking; most-constrained-variable ordering | Propagation rules are sound | Large practical speedups; worst case exponential |
| Repeated states in a search | Memoize states in a hash set | State has a canonical, hashable form | Repeated subtrees → explored once |
| Deep search where memory for BFS is too large | Iterative deepening (IDDFS, IDA*) | — | Same time order as BFS with O(depth) memory |

## Strings

| Signal | Technique | Valid when | Typical result |
|---|---|---|---|
| Many substring or repeated-pattern queries on a static text | Suffix array + LCP array | Text does not change; enough queries to amortize the build | Build: O(n log n), or O(n) with SA-IS; O(n) memory. Query: O(m log n) for a pattern of length m, plus O(k) to report k occurrences, instead of O(n·m) per scan |
| Distinct substrings, longest repeated or common substring | Suffix automaton | — | O(n²) or worse → O(n) build |
| Longest palindromic substring, all palindromes | Manacher's algorithm | — | O(n²) → O(n) |
| Border and period detection | Prefix function (KMP failure function) | — | O(n²) → O(n) |
| Edit distance when only small distances matter | Banded (Ukkonen) edit distance | A threshold k is known | O(n·m) → O(n·k) |
| Regular expression with nested or overlapping quantifiers (`(a+)+`, `(a\|a)*`, `.*.*x`), run by a backtracking engine on long or untrusted input | Rewrite the pattern to remove the ambiguity (atomic groups or possessive quantifiers where supported), or switch to a linear-time engine (Thompson NFA or lazy DFA, such as RE2, Rust's `regex`, Go's `regexp`) | Linear-time engines do not support backreferences or lookaround; match semantics must be checked one by one: leftmost-first versus leftmost-longest, capture group contents, Unicode classes, anchors and line modes. A new engine is usually a dependency (rule 7) | Exponential worst case → O(n·m) for text length n and pattern size m |
| Many regular expressions tried one after another on the same input | One combined alternation, or a regex set that reports every pattern that matched in one pass | Which pattern wins, and in which priority order, matches the original | k passes over the input → one pass |
| Regular expression used only to find a fixed string or a fixed prefix | Plain substring search or prefix check | Same case sensitivity, escaping, and Unicode handling | Constant factor; no engine setup |

## Number theory and math

| Signal | Technique | Valid when | Typical result |
|---|---|---|---|
| Many primality or divisibility checks up to N | Sieve of Eratosthenes | N fits in memory | Per-query trial division → O(N log log N) once, then O(1) |
| Many factorizations up to N | Smallest-prime-factor sieve | N fits in memory | O(√n) per query → O(log n) per query |
| Primality of large individual numbers | Miller-Rabin with deterministic bases for 64-bit integers | Use the known deterministic base set; otherwise the result is probabilistic and a behavior change | O(√n) → O(log³ n) |
| GCD, LCM, linear Diophantine equations, modular inverses | Euclidean and extended Euclidean algorithm | — | O(log min(a, b)) |
| Combinations, factorial ratios modulo a prime | Precomputed factorials and inverse factorials | The modulus is prime and larger than n | O(n) per query → O(1) after O(n) setup |
| Large powers, modular exponentiation | Binary exponentiation | — | O(n) → O(log n) multiplications |
| Linear recurrences for large n | Matrix exponentiation | Recurrence of fixed order k | O(n·k) → O(k³ log n) |
| Polynomial multiplication, convolution, counting pair sums | FFT or NTT | Floating-point FFT rounds, so results can differ (behavior change) unless values are small enough to round back exactly, with a stated error bound. NTT computes the result **modulo a prime**: it equals the exact integer result only when the prime exceeds every possible output coefficient, or when several primes are combined with the Chinese remainder theorem | O(n²) → O(n log n) |
| XOR constraints, parity systems, maximum subset XOR | XOR basis; Gaussian elimination over GF(2) | — | Exponential subset search → O(n · bits), or O(n³/w) with bitsets |

## Numerical computation

Floating-point results depend on the order and form of every operation. Most techniques here change results, usually for the better: they are behavior changes under rule 5, never reasons to skip the technique. Report the before and after values on representative and adversarial inputs (for example, the error against a high-precision reference), and let the developer decide. Compilers must not reassociate the new code (no fast-math flags on it), or the technique can silently stop working.

| Signal | Technique | Valid when | Typical result |
|---|---|---|---|
| Summing many floating-point values where accumulated rounding error matters | Kahan or Neumaier compensated summation (Neumaier also handles terms larger than the running sum) | Behavior change: results differ, usually closer to the exact sum. Strict floating-point semantics in the compiled code | Same O(n), a few more operations per element. Worst-case error bound grows with n for naive summation, and is nearly independent of n with compensation |
| Floating-point sum that should be vectorized or parallelized | Pairwise (cascade) summation | Behavior change: results differ | O(n); error bound grows as O(log n) instead of O(n); splits naturally into independent chunks |
| Sum must be identical regardless of order, chunking, or thread count | Reproducible summation: fixed-point integer accumulation, or an exact (superaccumulator) sum rounded once | Behavior change unless the original order was already fixed; value range is known for fixed point | Deterministic results that allow parallel and vectorized evaluation |
| Variance or standard deviation computed as mean of squares minus square of mean, or in two passes | Welford's online algorithm | Behavior change: avoids catastrophic cancellation, so results differ | Two passes → one pass, O(1) memory |
| Polynomial evaluated by computing each power separately | Horner's method | Behavior change in floating point (different rounding); exact for integers without overflow | O(n²) or O(n log n) multiplications → O(n) |
| Same linear system solved for many right-hand sides | Factorize once (LU, Cholesky, QR), then solve per right-hand side | Matrix does not change between solves; results may differ in the last bits | O(n³) per solve → O(n³) once + O(n²) per solve |
| Matrices or vectors that are mostly zeros | Sparse formats (CSR, CSC, COO) and sparse kernels | Density below a measured threshold (dense kernels win above it); summation order in the kernel may change floating-point results | O(n²) per matrix-vector product → O(nnz), with O(nnz) memory |
| Tight numeric loops in floating point | SIMD-friendly kernels: contiguous data, no aliasing, no data-dependent branches; vectorized math libraries | Vectorized reductions reorder additions (behavior change); vectorized math functions may round differently | Several times faster per core |
| Repeated exact arithmetic on integers or rationals carried in floating point | Integer or fixed-point arithmetic | Value ranges fit without overflow; switching from floating point is a behavior change | Faster on many platforms, and exact; required where floating point is unavailable (for example, most kernel code) |

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
| Several threads updating fields on the same cache line | See "false sharing" under "Memory locality" | — | — |

General lock-free and wait-free structures (multi-producer queues, lock-free hash maps) are subtle and easy to get wrong: prefer the platform's own concurrent structures, or a reviewed library with the developer's permission (rule 7).

## Streaming and external memory

For data larger than memory, or when memory must stay within a fixed budget. State the memory budget explicitly and distinguish exact algorithms from approximate ones (approximate results are always behavior changes).

| Signal | Technique | Valid when | Typical result |
|---|---|---|---|
| Sorting data larger than memory | External merge sort: sort chunks that fit, then k-way merge | Stable variant when the original sort was stable | Works within the memory budget; O(n log n) with sequential I/O |
| Aggregation (group by, counts, sums) over huge inputs | Streaming aggregation with bounded state; hash partitioning with spill to disk when keys exceed memory | Exact aggregation; output order matches the original | Memory bounded by the budget instead of input size |
| Joining two large datasets | Sort-merge join or partitioned hash join with spilling | Join semantics (nulls, duplicates, ordering) match the original | Fits the memory budget |
| Uniform random sample from a stream of unknown length | Reservoir sampling | Randomness: results differ from any other sampling method; behavior change unless it replaces an equivalent random sample with the same seed semantics | O(k) memory for a sample of k |
| Top-k or heavy hitters over a stream | Bounded heap (exact top-k); Misra-Gries or Space-Saving (approximate) | Approximate methods are behavior changes | O(k) memory |

## Hash table design

When the project implements its own hash table (common in C and in performance-critical code in any language), or a profile shows time inside a hash table, the table's design matters as much as the choice to use one. Changing the hash function, probing scheme, or capacity changes iteration order: a behavior change wherever callers iterate the table.

| Signal | Technique | Valid when | Typical result |
|---|---|---|---|
| Chained hash table with one heap-allocated node per entry, hot in profiles | Open addressing in one flat array: linear probing, Robin Hood hashing, or group probing with SIMD metadata (Swiss tables) | Load factor kept below the scheme's limit (roughly 0.7 to 0.9); deletion uses tombstones or backward-shift deletion; nothing holds a pointer to an entry across inserts, since entries move on resize | Same O(1) expected; far fewer cache misses and allocations |
| Long probe sequences, many collisions, or slow lookups only for some key sets | Better hash function with full mixing (keys with low-entropy bits, such as aligned pointers or sequential IDs, cluster under weak hashes); Robin Hood hashing to bound probe-length variance | The new hash is deterministic where the original was, or randomized where order was never observable | Longest probe sequence shrinks; worst-case lookups closer to expected |
| Keys come from untrusted input | Keyed hash with a secret per-process seed (for example, SipHash), or a balanced tree for a guaranteed bound | Changing the hash function changes iteration order | Hash flooding no longer degrades operations to O(n) each |
| Growth rehashes the whole table at once, and the pause matters (latency-sensitive or real-time code) | Incremental rehashing: keep the old and new tables and move a few buckets per operation | Lookups check both tables during migration | Worst-case single operation O(n) → O(1) extra per operation; same amortized cost |
| Key comparisons are expensive (long strings, composite keys) | Store each key's full hash beside it, and compare hashes before comparing keys | — | Most failed comparisons avoided |
| Table built once, then only read, with keys known at build time | Perfect hashing or a static sorted array (see "Structures for repeated queries" in `ALGORITHM-ARSENAL.md`) | Key set never changes after building | O(1) worst-case lookups |

## Storage and indexing

For storage engines, databases, file systems, and any index larger than memory, count block or page I/O, not comparisons: one page read from disk costs as much as many thousands of comparisons. Before choosing, record the workload: read and write mix, point versus range queries, key distribution, data size relative to memory, and the durability and crash-recovery contract.

Three costs trade against each other: read amplification (pages read per lookup), write amplification (bytes written per byte of new data), and space amplification (bytes stored per byte of live data). Lowering one usually raises another (the RUM conjecture, a conjecture rather than a proven bound). State which one the workload needs lowered, and measure the other two.

| Signal | Technique | Valid when | Typical result |
|---|---|---|---|
| Ordered index too large for memory, or point and range lookups through a page cache | B+ tree with node size matched to the page or block size; values only in leaves, leaves linked for range scans | Ordered keys with a fixed comparator | Page reads per lookup: O(log₂ n) for a binary tree → O(log_B n) for fanout B; a range scan reads consecutive leaves |
| In-memory ordered map where pointer chasing in a binary tree dominates | B-tree with small fixed-size nodes (a few cache lines) | Iteration order and comparator unchanged | Same O(log n); fewer cache misses |
| Write-heavy index where random in-place page updates dominate | Log-structured merge (LSM) tree: in-memory buffer plus write-ahead log, flushed to sorted immutable runs, merged by compaction | Deletes become tombstones; reads may check several runs; durability, crash recovery, and read-after-write timing must match the original contract, otherwise it is a behavior change | Random page writes → sequential batched writes; reads pay read amplification across runs |
| Choosing LSM compaction | Leveled compaction (lower read and space amplification, higher write amplification) or tiered compaction (the reverse) | Measured read and write mix | A trade-off, not a free win; benchmark both |
| LSM or on-disk lookups for keys that are often absent | Bloom or cuckoo filter per run or file, plus fence pointers (the first key of each page) in memory | Filter used only to skip reads, never to answer a lookup | Most negative lookups need no disk read; positive lookups read about one page per run |
| Sorted keys with long shared prefixes (paths, URLs, composite keys) | Prefix compression within pages; suffix truncation of separator keys in inner nodes | Key comparison results unchanged | Higher fanout, so fewer levels and page reads |
| Large static sorted integer sets (posting lists, ID sets) | Compressed representations: delta encoding with varint or bit packing, Elias-Fano, Roaring bitmaps | Set and order semantics unchanged | Several times less memory and I/O; intersections and unions run on compressed data |
| Sparse map from integer keys (page offsets, file descriptors, IDs) with ordered iteration | Radix tree (for example, the Linux kernel XArray) | Keys are integers of bounded width | O(log n) comparisons → O(key bits / bits per level) steps; no rebalancing |

## Spatial data

Spatial structures return candidates; the original exact geometric test still runs on each candidate, so results stay identical. The order in which results are returned usually changes: if callers observe it, sort the results back into the original order, or treat it as a behavior change. Workload shape decides the choice: dimensionality, object sizes, clustering, and how often objects move.

| Signal | Technique | Valid when | Typical result |
|---|---|---|---|
| Proximity or collision checks between all pairs of objects in 2D or 3D | Uniform grid or spatial hash, cell size near the query radius or typical object size | Objects are similar in size and spread fairly evenly | O(n²) → O(n + k) expected for k candidate pairs; degrades toward O(n²) when objects crowd into few cells |
| Moving objects checked every frame or tick | Rebuild a grid or spatial hash each tick, or sort and sweep along one axis (sort is nearly sorted from the last tick) | — | O(n²) per tick → O(n + k) or O(n log n), often nearly O(n) with insertion sort on nearly sorted input |
| Range, intersection, or containment queries over rectangles or polygons of mixed sizes (maps, GIS, CAD, UI hit testing) | R-tree; bulk-load with Sort-Tile-Recursive when the data is static | Queries use bounding boxes, with the exact test on candidates | O(n) per query → about O(log n + k) on typical data; no worst-case guarantee under heavy overlap |
| Points with uneven density in 2D or 3D | Quadtree (octree in 3D) | Maximum depth or minimum cell size bounded, so duplicate points cannot force unbounded subdivision | Per-query scan → proportional to depth plus output, workload-dependent |
| Nearest-neighbor or range search over points in low dimensions | k-d tree | Low dimensionality (roughly under 10); data mostly static | Build: O(n log n). Query: O(log n) average for well-distributed data, degrading toward O(n) for skewed data or higher dimensions; workload-dependent |
| Nearest neighbor in high dimensions (embeddings, feature vectors) | Exact: a well-vectorized linear scan usually beats trees above roughly 10 to 20 dimensions. Approximate: HNSW graphs, locality-sensitive hashing, product quantization | Approximate methods can miss true neighbors: **always a behavior change**, developer review | Exact scan: constant-factor gains only. Approximate: sublinear queries in practice |

## Caching and eviction

Hit rate decides whether a cache pays off, and the eviction policy decides the hit rate. Measure hit rate, eviction overhead, and memory per entry on a representative access trace before choosing a policy. A policy change alters which requests miss: it is a behavior change wherever a miss is observable (latency contracts, side effects or I/O on a miss, staleness, statistics exposed to callers). Every cache still needs an explicit bound (rule 1).

| Signal | Technique | Valid when | Typical result |
|---|---|---|---|
| Recency-driven workload with exact LRU required | Hash map + doubly linked list | — | O(1) per access |
| LRU bookkeeping on every hit is too expensive (lock contention, very high access rates, page caches) | CLOCK (second chance) or generalized CLOCK; multi-generational LRU | Approximate LRU order is acceptable; eviction order changes (behavior change where observable) | O(1) per access with no list reordering on hits; eviction is O(1) amortized |
| Sequential scans flush hot entries out of an LRU cache | Scan-resistant policies: segmented LRU, 2Q, LRU-K, ARC | Check the license and patent status of the chosen policy's implementation before adopting it | Higher hit rate on mixed scan and reuse workloads |
| Skewed frequencies, with many items used only once | LFU with O(1) frequency buckets; TinyLFU admission (a count-min sketch decides whether a new item may replace the eviction victim), as in W-TinyLFU | The sketch is approximate, but it only affects which items stay cached, never the values returned | Higher hit rate on skewed workloads; O(1) per access |
| Entries expire by time, found by scanning all entries | Expiry ordered by a heap, or a timing wheel (see "Specialized data structures") | Expiry precision matches the original | O(n) scan → O(log n) per entry, or O(1) with a timing wheel |

## Specialized data structures

| Signal | Technique | Valid when | Typical result |
|---|---|---|---|
| Predecessor and successor queries over a bounded integer universe u, at very high volume | Van Emde Boas tree, or a hierarchical bitset (y-fast trie for sparse sets) | Integer keys in [0, u); memory O(u) for van Emde Boas, less for hierarchical bitsets | O(log n) → O(log log u) |
| Sorted map needed but not in the standard library | Treap, skip list, or another balanced tree | — | O(n) → O(log n) expected |
| Overlap queries over many intervals | Interval tree, or a segment tree over compressed coordinates | — | O(n) per query → O(log n + k) |
| Nearest-neighbor or range search in low dimensions | k-d tree; see "Spatial data" for alternatives | Low dimensionality (roughly under 10); data mostly static | Build: O(n log n). Query: O(log n) average for well-distributed data, degrading toward O(n) for skewed data or higher dimensions; workload-dependent |
| Cheap pre-check before an expensive exact lookup | Bloom filter | Used **only as a pre-filter** before the exact check, so false positives never change results | Avoids most expensive lookups |
| Cheap pre-check before an exact lookup, where items are also removed | Cuckoo filter | Used **only as a pre-filter**; delete only items that were inserted; inserts can fail when the filter is nearly full, so handle that by resizing or falling back to the exact check | Same benefit as a Bloom filter, plus deletion; less space than a Bloom filter at low false-positive rates |
| Timers or timeouts scheduled and cancelled far more often than they fire (network stacks, kernels, connection pools) | Hierarchical timing wheel | Firing times rounded to the wheel's granularity match the original, otherwise behavior change | O(log n) heap insert and cancel → O(1) |
| Approximate counts, frequencies, or distinct counts over huge streams | Count-min sketch, HyperLogLog | Approximate results are acceptable. **Always a behavior change**: developer review | O(n) memory → O(1) or O(log n) memory, with fast updates |

## Advanced combinations

| Combination | Solves | Result |
|---|---|---|
| Meet-in-the-middle + hashing or sorting | Subset sum, balanced partition for medium n | O(2^n) → roughly O(2^(n/2) · n) |
| Euler tour + range structure | Subtree sums, counts, or updates | Per-query traversal → O(log n) |
| Tree DP + rerooting | An answer for every root | O(n²) → O(n) |
| Euler tour + sparse table | Lowest common ancestor queries | O(1) per query after O(n log n) setup |
| Offline sorting + union-find | Connectivity queries under thresholds | Repeated traversal → sorted processing |
| Aho-Corasick + failure links + DP | Counting or avoiding many patterns in generated strings | Repeated scans → linear in text and automaton size |
| Heavy-light decomposition + segment tree | Path queries and updates on trees | O(n) per query → O(log² n) |
