# Algorithm Arsenal

Use this file in Phase 3 to enumerate candidate approaches. It holds the core techniques. Load [ADVANCED-TECHNIQUES.md](ADVANCED-TECHNIQUES.md) as well when the techniques here do not reach the lower bound, or when the problem is about graphs, trees, dynamic programming, combinatorial search, strings, number theory, memory locality, parallelism and vectorization, streaming and external memory, or specialized data structures.

Do not stop at the first technique that improves the bound. Check every section whose signals match, then check the combinations.

## Start with five questions

Before choosing any algorithm, ask:

1. **Am I repeating work?** Cache, memoize, hoist invariants, or precompute.
2. **Am I searching repeatedly?** Build an index, hash set, sorted structure, or lookup table.
3. **Am I keeping more information than I need?** Use rolling state, a bounded heap, a streaming algorithm, or a compact representation.
4. **Can I reorder or batch the work?** Sort offline, sweep, batch I/O, or process independent work together.
5. **What assumptions make the faster algorithm valid?** Monotonicity, static versus changing data, value bounds, sign of values, ordering requirements, purity, memory limits. Every row below has a "Valid when" column. Confirm each assumption from the code, not from intuition, and record the evidence in the report.

Most wrong optimizations come from a technique used outside its assumptions.

## Complexity reference

| Big O | Name | Growth | Common examples |
|---|---|---|---|
| O(1) | Constant | Excellent. Runtime does not depend on input size. | Array index access, stack push/pop, hash lookup (expected) |
| O(log n) | Logarithmic | Good. Grows by a constant step when input doubles. | Binary search, balanced-tree lookup, heap push/pop |
| O(n) | Linear | Fair. Grows in proportion to input. | Single loop, linear search, building a hash index |
| O(n log n) | Linearithmic | Fair to bad. Typical of efficient comparison sorting. | Merge sort, heapsort, average-case quicksort |
| O(n²) | Quadratic | Bad. Quadruples when input doubles. | Two nested loops, bubble sort, insertion sort |
| O(n^c), c > 2 | Polynomial | Poor. Worse with each level of nesting. | Triple nested loops, naive matrix multiplication |
| O(c^n), c > 1 | Exponential | Very inefficient. Doubles (or worse) with each added element. | Naive recursive Fibonacci, brute-force subsets |
| O(n!) | Factorial | Worst. Impractical beyond tiny inputs. | Brute-force permutations, naive traveling salesperson |

"Expected" means averaged over the algorithm's randomness or hash behavior; "amortized" means averaged over a sequence of operations; neither is a worst-case guarantee (rule 9).

## Start from the current complexity

Find the row for the candidate's current cost, measured along the call chain (see Phase 2 in `WORKFLOW.md`), not only inside the function body. Start with the sections it names, then still check every other section whose signals match.

| Current cost | Usual cause | Look first at |
|---|---|---|
| O(n!) | Trying every ordering or assignment | Bitmask DP ("Bit manipulation"); sorting by a key when an exchange argument shows the order is determined ("Reusing work", greedy) |
| O(cⁿ) | Recursion that branches over overlapping subproblems; trying every subset | Memoization, DP, knapsack DP ("Reusing work"); meet-in-the-middle, branch and bound, constraint propagation ("Combinatorial search" in `ADVANCED-TECHNIQUES.md`). If the problem is NP-hard in general, check whether small integer weights or targets allow a pseudo-polynomial DP, or whether the input size keeps exact search affordable |
| O(n³) or higher polynomial | Triple-nested loops; a quadratic loop that calls a linear helper | Precompute what the innermost loop recomputes (prefix sums, a hash index); sort plus two pointers ("Combinations"); "Dynamic programming optimizations" in `ADVANCED-TECHNIQUES.md` |
| O(n²) | Nested loops over related collections; a linear search or front removal inside a loop | "Lookup, membership, counting", "Order and search", "Structures for repeated queries", "Combinations" |
| A product of size variables (O(n·m), O(V·E)) | For each A, scan all B | "Invert the loop" under "Reformulate before choosing": index one side once. Name every variable; the right fix depends on which one is large |
| O(n log n) | A sort, or n heap or tree operations | Whether the order is observable at all; top-k, min, or max without a full sort ("Priority and selection"); non-comparison sorts for bounded keys |
| O(n) per call, called many times | Recomputing from scratch on every call | "Precompute once, query many times" and "Incremental maintenance" under "Reformulate before choosing"; "Structures for repeated queries" |

## Required enumeration

For each candidate, write down:

1. The abstract problem statement.
2. The lower bound and its reason.
3. Every matching signal from the tables below and in `ADVANCED-TECHNIQUES.md`.
4. Candidate approaches in proportion to difficulty (rule 6). If the strongest candidate reaches the lower bound with the standard library and no behavior risks, name it and briefly explain why alternatives are unnecessary. Otherwise, at least three plausible approaches, including at least one combination when the problem has more than one dimension. Never invent alternatives to meet a quota.
5. For each approach: the assumptions it needs and the evidence from the code that they hold.
6. Whether the approach changes any observable behavior (see "Behavior-changing techniques" below).
7. The chosen approach, and why the others lost.

## Lower bounds

A lower bound tells you when to stop. Common ones:

- **Must read the input:** if the answer can depend on every element, Ω(n). No sublinear algorithm exists without preprocessing or extra structure (sortedness, an index).
- **Comparison sorting:** Ω(n log n). Beat it only with non-comparison sorts (counting, radix, bucket) when keys are bounded integers or fixed-width.
- **Search in unsorted data:** Ω(n) per query. Repeated queries change the picture: build an index once in O(n), then answer each in O(1) expected.
- **Search in sorted data:** comparison-based lookup takes Θ(log n). For repeated exact-key queries, a hash index gives O(1) expected lookup after O(n) expected preprocessing and O(n) extra space. It does not pay off for a one-off query, it must preserve the original equality semantics, and its worst-case lookup is slower.
- **Output size:** if the result has k elements, Ω(k). Listing all pairs is Ω(n²) when there can be n² pairs.
- **No known faster algorithm:** some problems have only conjectured bounds. No algorithm substantially faster than O(n²) is known for 3SUM (three elements summing to a target) and the many problems that reduce to it. No polynomial algorithm is known for NP-hard problems such as 0/1 knapsack, subset sum, or the traveling salesperson. Stop there and say the bound is conjectured; do not promise better.
- **Repeated calls:** when a function is called m times on the same or slowly changing data, the real cost is total work across all calls. Preprocessing once plus cheap queries can beat any per-call algorithm.

If the chosen approach is above the lower bound, say why: the better bound needs an unapproved dependency, needs preprocessing that the call pattern cannot amortize, needs an assumption the code does not satisfy, or has constant factors that lose at realistic sizes (backed by a benchmark).

## Reformulate before choosing

Many large wins come from changing the problem rather than speeding up the loop:

- **Precompute once, query many times.** Move invariant work out of loops and out of repeated calls: build a map, prefix array, or sorted copy once.
- **Invert the loop.** Instead of "for each A, scan all B," index B once and look up each A.
- **Count the complement.** Counting what fails can be cheaper than counting what passes.
- **Transform the key space.** Coordinate compression, normalizing keys, sorting by one dimension to make another dimension a sweep.
- **Offline processing.** If all queries are known up front, sort or batch them.
- **Incremental maintenance.** Update a running result when data changes instead of recomputing from scratch.
- **Push work to the right layer.** A filter, join, or aggregate in the database query instead of in a loop over rows.

## Signals and techniques

How to read the tables in this file and in `ADVANCED-TECHNIQUES.md`:

- **Costs are bounds, not promises.** "Typical result" shows the change in asymptotic cost when the "Valid when" conditions hold.
- **Preprocessing is separate from queries.** When a technique builds a structure, its build time and memory are stated separately from per-query cost. Count both against the real call pattern.
- **Output cost counts.** A query that returns k results costs at least O(k) on top of the search.
- **Labels matter.** Bounds are worst case unless marked expected, amortized, or average. Phrases such as "in practice" mark workload-dependent speedups, not guaranteed complexity improvements.

### Lookup, membership, counting

| Signal in code | Technique | Valid when | Typical result |
|---|---|---|---|
| `contains`, `indexOf`, `find`, `includes` inside a loop | Hash set or hash map built once | Elements have consistent equality and hashing, matching the original comparison exactly | O(n·m) → O(n + m) expected |
| Counting occurrences with nested loops | Hash map of counts; counting array | Counting array: keys are small, dense integers | O(n²) → O(n) expected (array: worst case) |
| Grouping by a key with repeated filters | Single-pass grouping into a map | Group order and item order match the original | O(n·g) → O(n) expected |
| Keys are small dense integers | Plain array indexed by key | Key range is known and small enough to allocate | Same Big-O as hashing, but worst-case O(1) with smaller constants |
| Duplicate detection | Hash set; or sort then compare neighbors | Sorting: the input may be copied or reordered, and an ordering exists | O(n²) → O(n) expected, or O(n log n) |
| Repeated range sums | Prefix sums | Data does not change between queries (otherwise use a Fenwick tree or rebuild); sums cannot overflow differently | O(n) per query → O(1) per query after O(n) setup |
| Many range increments, read at the end | Difference array, then one prefix-sum pass | All updates happen before reads | O(n·q) → O(n + q) |
| Repeated range XOR | Prefix XOR | Data does not change between queries | O(n) per query → O(1) per query after O(n) setup |
| Many range minimum/maximum queries | Sparse table | Data does not change; the operation is idempotent (min, max, gcd, and, or) | O(n) per query → O(1) per query after O(n log n) setup |
| Union, intersection, difference of integer sets | Bitset, or merge of sorted lists | Bitset: small integer universe. Merge: both inputs sorted | O(n·m) → O(u/w) word operations or O(n + m) |

### Order and search

| Signal | Technique | Valid when | Typical result |
|---|---|---|---|
| Linear scan of sorted data | Binary search | Sorted by the same comparator the search uses, and the comparator is consistent; random access available; which match is returned among duplicates, and the not-found result, match the original | O(n) → O(log n) |
| First index or smallest value that satisfies a condition | Binary search on a monotonic predicate | The predicate is monotonic over the search range (false…false, true…true); the comparator is consistent; boundary behavior (empty range, no match, all match, duplicates) matches the original | O(range · check) → O(log range · check) |
| Pair or triple search over sorted data | Two pointers | Sorted; moving a pointer provably excludes the skipped candidates | O(n²) → O(n) after sorting |
| Aggregate over every fixed-size window | Running aggregate updated as the window slides | The aggregate is invertible (sum, count, XOR) | O(n·k) → O(n) |
| Minimum or maximum of every fixed-size window (not invertible, so a running aggregate cannot remove elements) | Monotonic deque | — | O(n·k) → O(n) amortized total: each element enters and leaves the deque at most once |
| Longest or shortest contiguous run meeting a condition | Variable sliding window | The condition is monotonic as the window grows or shrinks (for example, sums of non-negative values, or "at most k distinct"). **Negative values usually break it.** | O(n²) → O(n) |
| Subarrays with an exact target sum, values of any sign | Prefix sum + hash map of prefix counts | Exact-equality condition | O(n²) → O(n) expected |
| Sum constraints with negative values (shortest subarray with sum ≥ k, and similar) | Prefix sums + monotonic deque, or prefix sums + sorted structure | Depends on the exact condition; prove the deque invariant | O(n²) → O(n) or O(n log n) |
| Next greater or smaller element, spans, histogram areas | Monotonic stack | — | O(n²) → O(n) amortized total: each element is pushed and popped at most once |
| Overlapping intervals, merging ranges | Sort by start, then sweep | — | O(n²) → O(n log n) |
| Events over time (concurrent sessions, resource counts) | Sweep line over sorted endpoints | Tie order of start and end events matches the original semantics | O(n²) → O(n log n) |
| Sorting bounded integers | Counting sort or radix sort | Keys are bounded integers or fixed-width; use the stable variant when equal keys carry other data | O(n log n) → O(n + k) |
| Removing from the front or inserting in the middle of an array | Deque or ring buffer; swap-with-last removal | Swap-with-last changes element order: only when no caller observes order, confirmed from every caller. Otherwise it is a behavior change | O(n) per operation → O(1) |
| Longest increasing or non-decreasing subsequence | Patience sorting + binary search | Strict versus non-strict comparison matches the original | O(n²) → O(n log n) |
| Merging k sorted sequences | k-way merge with a heap | Inputs sorted by the same comparator; tie order matches the original | O(N·k) → O(N log k) |

### Priority and selection

| Signal | Technique | Valid when | Typical result |
|---|---|---|---|
| Sorting everything to take the top k | Heap of size k; or quickselect, then sort only the k selected | Tie handling matches the original. Quickselect reorders its input, so work on a copy | O(n log n) → O(n log k), or O(n + k log k) expected |
| k-th smallest or median, one-off | Quickselect; median-of-medians for a worst-case guarantee | Input may be copied or reordered | O(n log n) → O(n) expected, or O(n) worst case |
| Repeatedly taking the minimum of a changing set | Binary heap | Build from existing data with heapify | O(n) per extraction → O(log n); heapify O(n); insert O(log n) |
| Running median | Two heaps | — | O(n) per insert → O(log n) |
| Minimum and maximum of a changing set | Sorted map or sorted multiset (balanced tree) | Two heaps also work but need lazy deletion to stay consistent | O(n) per query → O(log n) |
| k-th element of a changing ordered collection | Order-statistic tree, or a Fenwick tree over compressed values | Fenwick: all values known up front for compression | O(n) → O(log n) |
| Merging k sorted lists | Heap of list heads | — | O(N·k) → O(N log k) |

### Structures for repeated queries

| Signal | Technique | Valid when | Typical result |
|---|---|---|---|
| "Are these connected / in the same group?" with merges | Union-find with path compression and union by rank or size | Merges only (no splits) | O(α(n)) amortized per operation (α is the inverse Ackermann function, at most 4 for any practical n) |
| Prefix matching, autocomplete, word lookup | Trie | The set of words is built once or changes rarely; key representation and matching semantics (case, normalization) are preserved | Build: O(L) for L total characters. Lookup: O(m) for a query of length m, instead of scanning every word; plus O(k) output cost when returning k matches |
| Range sums or counts with point updates | Fenwick (binary indexed) tree | The operation is invertible (sum, count, XOR) | Query O(n) → O(log n); point update O(1) → O(log n) |
| Range queries with point updates, any associative operation (min, max, gcd) | Segment tree | The operation is associative | Query O(n) → O(log n); point update O(1) → O(log n) |
| Range updates and range queries together | Segment tree with lazy propagation | Updates compose with each other and with the aggregate | O(n) per operation → O(log n) worst case per operation |
| Floor, ceiling, predecessor, successor, ordered iteration with inserts | Balanced BST / sorted map | — | O(n) → O(log n) |
| Fixed set of keys known in advance | Precomputed lookup table, or perfect hashing for a static key set | Key set never changes at runtime | O(1) worst case |
| LRU or bounded cache | Hash map + doubly linked list (often built in, see language files) | The cached function is pure | O(1) per operation, bounded memory |

### Graphs

| Signal | Technique | Valid when | Typical result |
|---|---|---|---|
| Shortest path, unweighted | BFS | — | Path enumeration → O(V + E) |
| Shortest path from many sources at once | Multi-source BFS | Unweighted | k BFS runs → one O(V + E) |
| Shortest path, weighted | Dijkstra with a heap | **Non-negative weights only.** Negative weights: see `ADVANCED-TECHNIQUES.md` | O(V²) → O((V + E) log V) |
| Shortest path, weights 0 or 1 | 0-1 BFS with a deque | Weights are exactly 0 or 1 | O((V + E) log V) → O(V + E) |
| Dependency order, build order | Topological sort (Kahn or DFS) | Graph is a DAG; detect and report cycles the same way the original did | O(V + E) |
| Directed cycle or deadlock detection | Three-color DFS, or topological-sort failure | — | O(V + E) |
| Connected regions in a grid | Flood fill with iterative BFS or DFS | Recursion depth: iterative code no longer overflows the stack. If the original overflowed on valid input, that is a bug removed as a side effect: apply and document it (rule 4) | O(V + E) |
| Repeated reachability or recomputation over a static graph | Precompute components, memoize per node | Graph does not change between queries | Per-query traversal → O(1) per query |
| Minimum spanning tree | Kruskal (sort + union-find) or Prim (heap) | Tie-breaking among equal-weight edges matches the original when the chosen tree is observable | O(E log E) |

### Reusing work

| Signal | Technique | Valid when | Typical result |
|---|---|---|---|
| Recursion that recomputes the same arguments | Memoization | The function is pure (see "Hidden inputs" in `BEHAVIOR-TRAPS.md`); subproblems actually repeat (if they rarely recur, a cache only costs memory); the cache is bounded; its scope (per call, per object, or process-wide) is stated, along with how it is invalidated | Exponential → O(distinct states × work per state) |
| Optimal-choice problems over sequences, grids, subsets | Dynamic programming | Optimal substructure and overlapping subproblems | Exponential → O(states × transitions per state) |
| DP where each state depends only on the previous row or a few previous states | Rolling arrays / state compression | — | **Memory only**: O(n·m) space → O(m). Time is unchanged |
| Deep recursion over overlapping subproblems | Bottom-up DP | Converting recursion to iteration removes stack overflows on large inputs: a bug removed as a side effect, applied and documented under rule 4 | Same time; no call-stack depth |
| Locally optimal choice is provably globally optimal | Greedy, with an exchange argument written down | The proof holds for every input the code accepts | Polynomial → O(n log n) or O(n) |
| Subset or capacity problems with small integer targets | Knapsack DP indexed by achievable sum | Integer weights and a target T small enough for a table | O(2^n) → O(n·T) (pseudo-polynomial) |
| Counting the number of ways, not enumerating them | DP with counting | A numeric type or modulus that cannot overflow differently from the original | Enumeration → O(states × transitions per state) |
| Enumerating solutions with many dead ends | Backtracking with pruning, constraint propagation, branch and bound | Pruning rules never discard a valid solution; result order matches if observable | Large practical speedups; worst case stays exponential |
| Loops that compute sums of series, counts, arithmetic progressions | Closed-form formula | The formula cannot overflow or round differently from the loop | O(n) → O(1) |
| Repeated exponentiation, linear recurrences | Binary exponentiation; matrix exponentiation | The operation is associative | O(n) → O(log n) |
| Work that splits into independent halves | Divide and conquer | — | O(n²) → O(n log n) in many cases |

### Strings

| Signal | Technique | Valid when | Typical result |
|---|---|---|---|
| String concatenation in a loop | Builder or join | — | O(n²) → O(n) |
| Substring search with long patterns or many searches | KMP, Z-algorithm, or the platform's optimized search | Same matching semantics (case, culture, overlapping matches) | O(n·m) → O(n + m) |
| Comparing many substrings | Rolling hash with prefix hashes and powers | Every hash match is confirmed with a direct comparison, so collisions cannot change results | O(n·m) → O(n) expected; O(1) per substring hash after O(n) setup |
| Anagram or character-frequency checks | Fixed-size count array | Small, known alphabet | O(n log n) → O(n) |
| Many patterns against one text | Aho-Corasick | — | O(n·p) → O(n + L + z), where L is total pattern length and z is the number of matches |
| Many repeated string comparisons or groupings | Canonical keys, interned IDs, or sorted signatures | Canonicalization preserves the original equality exactly | Repeated O(length) comparisons → O(1) ID comparisons |

## Production patterns

In real systems, removing repeated work, allocation, and I/O often matters more than changing the algorithm. Many of these change behavior in subtle ways; the last column says what to check.

| Signal | Technique | Valid when | Behavior risk |
|---|---|---|---|
| Same expensive expression computed in every loop iteration | Hoist it out of the loop | The expression has no side effects and its inputs do not change inside the loop | Low |
| Repeated parsing, regex compilation, formatter creation | Create once and reuse | The reused object is safe to share (thread safety) | Shared state |
| Objects allocated in a hot loop | Reuse buffers or objects; primitive representations | No caller, closure, or other thread retains the reused object | Aliasing and thread safety: see `BEHAVIOR-TRAPS.md` |
| Large collection copied only to read or iterate | View, iterator, span, or reference | The source is not mutated while the view is alive | Aliasing |
| Only the first match or a yes/no answer is needed | Early exit, short-circuit evaluation, lazy iteration | Skipped iterations have no side effects | **Behavior change** if skipped iterations had effects or could throw |
| Many tiny objects or linked structures | Contiguous arrays, flat maps, packed representations | Callers do not rely on object identity | Identity |
| Expensive result that depends on a small set of inputs | Memoization or caching with explicit bounds, scope, and invalidation | The function is pure, including hidden inputs (time, locale, configuration, user or tenant context) | Staleness if not pure; data leaking across users if the cache key omits user, tenant, or permission context |
| Database rows fetched one at a time (N+1) | Batch loading, joins, eager loading, DataLoader-style batching | — | Result order, transaction boundaries, partial failure |
| Whole dataset loaded when a subset is used | Projection, filtering at the source, streaming, pagination | Every caller uses only the subset | **Behavior change** if callers receive different objects or pages: developer review |
| Independent network or I/O operations run sequentially | Batching or bounded concurrency | Operations are truly independent | **Behavior change**: ordering, error handling, rate limits; developer review |
| Unbounded queues or unbounded concurrent requests | Backpressure, bounded queues, admission control | — | **Behavior change** under load (blocking or rejecting); developer review |
| Full recomputation after a small change | Incremental computation, dependency tracking | Every dependency is tracked | Staleness if a dependency is missed |
| Heavy work on a UI thread, event loop, or request thread | Move work elsewhere; precompute; cache derived values | Threading is part of the contract (rule 11) | **Behavior change**: developer review |
| Optimization based on intuition alone | Profiling, benchmarking, allocation tracing | — | Finds actual bottlenecks before adding complexity (rule 8) |

### Database queries

Inspect the actual query plan (`EXPLAIN`, `EXPLAIN ANALYZE`, or the database's equivalent) on representative data before recommending any index or query change. Never guess from the SQL text alone.

| Signal | Technique | Valid when | Behavior risk |
|---|---|---|---|
| Full table scans for selective filters or joins | Index on the filtered or joined columns; composite index ordered to match equality columns first, then range or sort columns | The query plan shows the scan, and the filter is selective | Schema change: slower writes, more storage, locking during creation. Developer approval required |
| Predicates that prevent index use (functions or casts on indexed columns, leading wildcards, implicit type conversions) | Rewrite the predicate so the index applies, or index the expression | The rewritten predicate is exactly equivalent, including nulls, collation, and time zones | Subtle result changes if not exactly equivalent |
| `ORDER BY` or `DISTINCT` that the caller does not need | Remove it only if no caller depends on order or uniqueness | Every caller checked | **Behavior change** if any caller depends on it |
| Deep `OFFSET` pagination | Keyset (seek) pagination on an indexed, unique ordering | — | **Behavior change**: page boundaries under concurrent writes and the API shape; developer review |
| `SELECT *` or loading whole entities for a few fields | Projection of only the needed columns | Every caller uses only those fields | **Behavior change** if callers receive a different type |
| Counting rows only to check existence | `EXISTS` or `LIMIT 1` | — | Low |

## Behavior-changing techniques

Some techniques in this file and in `ADVANCED-TECHNIQUES.md` necessarily change observable behavior: element order, laziness, side effects skipped, concurrency, error and crash behavior, approximate instead of exact results, or the shape of what callers receive. Rule 5 applies to every one of them:

- Never apply a behavior-changing optimization silently.
- Document it in the report under "Behavior changes for review," with the exact behavior before and after.
- Apply it only after the developer explicitly approves that item, then add the `BEHAVIOR-CHANGE` marker from `REPORTING.md`.

This includes changes that look like improvements: a function that fails faster, returns results in a "more sensible" order, or no longer throws an exception callers may rely on. Those are behavior changes, and the developer decides.

The one exception is a bug removed as a side effect of the best optimization (rule 4), such as an iterative rewrite that no longer overflows the stack. The optimization is applied without waiting, and the bug is documented in the bug log, marked `BEHAVIOR-CHANGE` in the code, and reported to the developer.

## Bit manipulation

Bits win cleanly in specific cases in any kind of codebase. Use them when they reduce complexity or replace a heavier structure, and comment every non-obvious expression. Expressions below use C-style operators; each language file gives the exact syntax (Kotlin uses `and`, `or`, `xor`, `shl`, `inv()`).

| Use | How | When it helps |
|---|---|---|
| Small set of flags (permissions, features, states) | One `Int` or `Long` as a bitmask; `OptionSet` in Swift; `EnumSet` in Java; `[Flags]` enum in C# | Set operations become single O(1) instructions; no allocation |
| Set of integers in a known small range | Bitset (`BitSet`, `BitArray`, or an array of words) | Membership, union, intersection in O(u/64) word operations instead of hashing |
| Test, set, clear, toggle bit i | `x & (1 << i)`, `x \| (1 << i)`, `x & ~(1 << i)`, `x ^ (1 << i)` | O(1) state checks |
| Count set bits | Built-in popcount (see language files) | O(1) hardware instruction instead of a loop |
| Lowest set bit | `x & -x`; trailing-zero count | Iterate only set bits: O(set bits) instead of O(width) |
| Power of two check | `x > 0 && (x & (x - 1)) == 0` | O(1) |
| Find the unique element when all others appear twice | XOR of all elements | O(n) time, O(1) space |
| Enumerate all subsets of a small set | Iterate masks 0 until 2^n | Simpler and faster than recursive subset generation |
| Enumerate all submasks of every mask | `for (s = m; s > 0; s = (s - 1) & m)` | O(3^n) total across all masks, instead of O(4^n) |
| Subset DP (assignments, small traveling salesperson) | DP indexed by bitmask | O(n!) → O(2^n · n²) |
| Packing several small fields into one key | Shifts and masks into a `Long` | Composite hash keys without allocating pair objects |

Watch for: signed versus unsigned shifts, integer width (JavaScript bitwise operators work on 32-bit signed integers), overflow when shifting by the full width, and readability. See the language files for exact operators. More bit-based techniques (XOR basis, GF(2) elimination, sum over subsets) are in `ADVANCED-TECHNIQUES.md`.

## Combinations

The best solution often connects two techniques. Check these whenever a problem has two dimensions (for example, order and lookup).

| Combination | Solves | Result |
|---|---|---|
| Hash map + prefix sum | Count or find subarrays with a given sum, values of any sign | O(n²) → O(n) expected |
| Hash map + prefix XOR | Count subarrays with a given XOR | O(n²) → O(n) expected |
| Difference array + prefix sum | Many range updates, then read the final values | O(n·q) → O(n + q) |
| Sort + two pointers | Pair/triple sums, closest pairs, merging | O(n²) or O(n³) → O(n log n) or O(n²) |
| Sort + binary search | Many lookups against a fixed collection when hashing is not possible (ranges, nearest value) | O(n·m) → O((n + m) log n) |
| Binary search + monotonic predicate (often a greedy check) | Minimize the maximum, minimum feasible capacity, splitting into groups | O(range · check) → O(log range · check) |
| Heap + hash map | LRU/LFU caches, Dijkstra with decrease-key, top-k frequent | O(n) operations → O(log n) or O(1) |
| Monotonic deque + sliding window | Window maximum/minimum, DP with window constraints | O(n·k) → O(n) |
| Sort + union-find | Kruskal MST; offline connectivity under edge-weight thresholds | Repeated traversal → O(E log E) |
| Trie + DFS | Word search in a grid, prefix enumeration | Per-word search → shared prefix search |
| DP + bitmask | Small-set assignment and ordering problems | Factorial → exponential with small base |
| DP + binary search | Longest increasing subsequence | O(n²) → O(n log n) |
| Prefix sums + binary search | Weighted random choice, "first index where the cumulative total exceeds x" | O(n) per query → O(log n) |
| Hash map + doubly linked list | O(1) ordered cache with eviction | Bounded memory and O(1) operations |
| Sweep line + heap | Meeting rooms, skyline, interval scheduling with resources | O(n²) → O(n log n) |
| Coordinate compression + Fenwick tree | Counting inversions, rank queries over large value ranges (compression preserves order and equality among known values, not distances between them) | O(n²) → O(n log n) |
| Coordinate compression + segment tree | Changing rank and range queries over large values | Avoids structures indexed by raw values |
| Sweep line + coordinate compression + Fenwick tree | Counting overlaps, inversions, or active values | O(n²) → O(n log n) |

More combinations (meet-in-the-middle, Euler tour, tree rerooting, and others) are in `ADVANCED-TECHNIQUES.md`.

## When the best technique is not available

If the best approach needs a structure the standard library lacks (for example, a heap in JavaScript, a deque in Swift, a sorted map in Kotlin Multiplatform common code):

1. Prefer a small, well-tested implementation inside the project when it is short (a binary heap is about 40 lines). Give it its own unit tests.
2. If a robust implementation is large or subtle (balanced trees, suffix structures, Aho-Corasick), propose the dependency to the developer with its name, version, license, size, and what it buys, and wait for permission.
3. Report the best approach available without the dependency as the fallback.
