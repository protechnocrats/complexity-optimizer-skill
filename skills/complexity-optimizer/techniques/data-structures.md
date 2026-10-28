# Specialized Data Structures, Hash Tables, and Caches

Part of the advanced techniques. The shared rules in `ADVANCED-TECHNIQUES.md` apply to every table in this file; read them first. Tables are read as described there.

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
| Cheap pre-check before an expensive exact lookup | Bloom filter | Used **only as a pre-filter** before the exact check, so false positives never change results | Avoids most expensive lookups |
| Cheap pre-check before an exact lookup, where items are also removed | Cuckoo filter | Used **only as a pre-filter**; delete only items that were inserted; inserts can fail when the filter is nearly full, so handle that by resizing or falling back to the exact check | Same benefit as a Bloom filter, plus deletion; less space than a Bloom filter at low false-positive rates |
| Timers or timeouts scheduled and cancelled far more often than they fire (network stacks, kernels, connection pools) | Hierarchical timing wheel | Firing times rounded to the wheel's granularity match the original, otherwise behavior change | O(log n) heap insert and cancel → O(1) |
| Approximate counts, frequencies, or distinct counts over huge streams | Count-min sketch, HyperLogLog | Approximate results are acceptable. **Always a behavior change**: developer review | O(n) memory → O(1) or O(log n) memory, with fast updates |
