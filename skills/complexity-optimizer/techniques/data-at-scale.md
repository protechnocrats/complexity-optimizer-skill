# Data at Scale: Streaming and Storage

Part of the advanced techniques. The shared rules in `ADVANCED-TECHNIQUES.md` apply to every table in this file; read them first. Tables are read as described there.

## Streaming and external memory

For data larger than memory, or when memory must stay within a fixed budget. State the memory budget explicitly and distinguish exact algorithms from approximate ones (approximate results are always behavior changes).

| Signal | Technique | Valid when | Typical result |
|---|---|---|---|
| Sorting data larger than memory | External merge sort: sort chunks that fit, then k-way merge | Stable variant when the original sort was stable | Works within the memory budget; O(n log n) with sequential I/O |
| Aggregation (group by, counts, sums) over huge inputs | Streaming aggregation with bounded state; hash partitioning with spill to disk when keys exceed memory | Exact aggregation; output order matches the original | Memory bounded by the budget instead of input size |
| Joining two large datasets | Sort-merge join or partitioned hash join with spilling | Join semantics (nulls, duplicates, ordering) match the original | Fits the memory budget |
| Uniform random sample from a stream of unknown length | Reservoir sampling | Randomness: results differ from any other sampling method; behavior change unless it replaces an equivalent random sample with the same seed semantics | O(k) memory for a sample of k |
| Top-k or heavy hitters over a stream | Bounded heap (exact top-k); Misra-Gries or Space-Saving (approximate) | Approximate methods are behavior changes | O(k) memory |

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
