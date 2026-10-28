# Algorithm Arsenal

Use this file in Phase 3 to enumerate candidate approaches. Do not stop at the first technique that improves the bound. Check every section whose signals match, then check the combinations.

## Complexity reference

| Big O | Name | Growth | Common examples |
|---|---|---|---|
| O(1) | Constant | Excellent. Runtime does not depend on input size. | Array index access, stack push/pop, hash lookup (average) |
| O(log n) | Logarithmic | Good. Grows by a constant step when input doubles. | Binary search, balanced-tree lookup, heap push/pop |
| O(n) | Linear | Fair. Grows in proportion to input. | Single loop, linear search, building a hash index |
| O(n log n) | Linearithmic | Fair to bad. Typical of efficient comparison sorting. | Merge sort, heapsort, average-case quicksort |
| O(n²) | Quadratic | Bad. Quadruples when input doubles. | Two nested loops, bubble sort, insertion sort |
| O(n^c), c > 2 | Polynomial | Poor. Worse with each level of nesting. | Triple nested loops, naive matrix multiplication |
| O(c^n), c > 1 | Exponential | Very inefficient. Doubles (or worse) with each added element. | Naive recursive Fibonacci, brute-force subsets |
| O(n!) | Factorial | Worst. Impractical beyond tiny inputs. | Brute-force permutations, naive traveling salesperson |

## Required enumeration

For each candidate, write down:

1. The abstract problem statement.
2. The lower bound and its reason.
3. Every matching signal from the tables below.
4. At least three candidate approaches, including at least one combination when the problem has more than one dimension.
5. The chosen approach, and why the others lost.

## Lower bounds

A lower bound tells you when to stop. Common ones:

- **Must read the input:** if the answer can depend on every element, Ω(n). No sublinear algorithm exists without preprocessing or extra structure (sortedness, an index).
- **Comparison sorting:** Ω(n log n). Beat it only with non-comparison sorts (counting, radix, bucket) when keys are bounded integers or fixed-width.
- **Search in unsorted data:** Ω(n) per query. Repeated queries change the picture: build an index once in O(n), then answer each in O(1) average.
- **Sorted data search:** Ω(log n) comparison-based; O(1) average with a hash index.
- **Output size:** if the result has k elements, Ω(k). Listing all pairs is Ω(n²) when there can be n² pairs.
- **Repeated calls:** when a function is called m times on the same or slowly changing data, the real cost is total work across all calls. Preprocessing once plus cheap queries can beat any per-call algorithm.

If the chosen approach is above the lower bound, say why: the better bound needs an unapproved dependency, needs preprocessing that the call pattern cannot amortize, or has constant factors that lose at realistic sizes (backed by a benchmark).

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

### Lookup, membership, counting

| Signal in code | Technique | Typical result |
|---|---|---|
| `contains`, `indexOf`, `find`, `includes` inside a loop | Hash set or hash map built once | O(n·m) → O(n + m) average |
| Counting occurrences with nested loops | Hash map of counts; counting array for small integer keys | O(n²) → O(n) |
| Grouping by a key with repeated filters | Single pass `groupBy` into a map | O(n·g) → O(n) |
| Keys are small dense integers | Plain array indexed by key instead of a hash map | Same Big-O, much smaller constants, no hashing |
| Duplicate detection | Hash set; or sort then compare neighbors when memory is constrained | O(n²) → O(n) average |
| Repeated range sums over static data | Prefix sums | O(n) per query → O(1) per query after O(n) setup |
| Many range increments, read at the end | Difference array | O(n) per update → O(1) per update |

### Order and search

| Signal | Technique | Typical result |
|---|---|---|
| Linear scan of sorted data | Binary search | O(n) → O(log n) |
| "Smallest value that satisfies a condition" with a monotonic check | Binary search on the answer | Brute force over values → O(log range · check) |
| Pair or triple search over sorted data | Two pointers | O(n²) → O(n) after sort |
| Best contiguous run, fixed or variable window | Sliding window | O(n·k) → O(n) |
| "Next greater/smaller element," spans, histogram areas | Monotonic stack | O(n²) → O(n) amortized |
| Maximum or minimum of every window | Monotonic deque | O(n·k) → O(n) amortized |
| Overlapping intervals, scheduling, merging ranges | Sort by start then sweep | O(n²) → O(n log n) |
| Events over time (meeting rooms, concurrent sessions) | Sweep line over sorted endpoints | O(n²) → O(n log n) |
| Sorting bounded integers | Counting sort or radix sort | O(n log n) → O(n + k) |

### Priority and selection

| Signal | Technique | Typical result |
|---|---|---|
| Sorting everything to take the top k | Heap of size k | O(n log n) → O(n log k) |
| k-th smallest or median, one-off | Quickselect (average O(n)); median-of-medians for worst-case O(n) | O(n log n) → O(n) |
| Repeatedly taking the minimum of a changing set | Binary heap / priority queue | O(n) per extraction → O(log n) |
| Merging k sorted lists | Heap of list heads | O(N·k) → O(N log k) |
| Running median | Two heaps | O(n) per insert → O(log n) |

### Structures for repeated queries

| Signal | Technique | Typical result |
|---|---|---|
| "Are these connected / same group?" with merges | Union-find with path compression and union by rank | Near O(1) amortized per operation |
| Prefix matching, autocomplete, word lookup | Trie | O(total words · length) → O(length) per query |
| Range queries with point updates | Fenwick (binary indexed) tree | O(n) per query → O(log n) per query and update |
| Range queries with range updates, or non-invertible ops (min/max) | Segment tree, with lazy propagation if needed | O(n) → O(log n) |
| Floor, ceiling, predecessor, successor, ordered iteration with inserts | Balanced BST / sorted map | O(n) → O(log n) |
| Fixed set of keys known at build time | Precomputed lookup table or perfect hashing | O(1) worst-case |
| LRU or bounded cache | Hash map + doubly linked list (often built in, see language files) | O(1) per operation, bounded memory |

### Graphs

| Signal | Technique | Typical result |
|---|---|---|
| Shortest path, unweighted | BFS | Avoids exponential path enumeration; O(V + E) |
| Shortest path from many sources at once | Multi-source BFS | k separate BFS runs → one O(V + E) |
| Shortest path, non-negative weights | Dijkstra with a heap | O(V²) → O((V + E) log V) |
| Shortest path, weights 0 or 1 | 0-1 BFS with a deque | O((V + E) log V) → O(V + E) |
| Dependency order, build order, cycle detection in DAGs | Topological sort (Kahn or DFS) | O(V + E) |
| Repeated reachability or recomputation over a static graph | Precompute components, memoize per node | Per-query traversal → O(1) per query |
| Minimum spanning tree | Kruskal (sort + union-find) or Prim (heap) | O(E log E) |

### Reusing work

| Signal | Technique | Typical result |
|---|---|---|
| Recursion that recomputes the same arguments | Memoization (pure functions only, bounded cache) | Exponential → polynomial |
| Optimal-choice problems over sequences, grids, subsets | Dynamic programming, bottom-up; then reduce the table to rolling rows if only the previous row is needed | Exponential → polynomial; then O(n²) space → O(n) space |
| Locally optimal choice is provably globally optimal | Greedy, with an exchange argument written down | Polynomial → O(n log n) or O(n) |
| Loops that compute sums of series, counts of combinations, arithmetic progressions | Closed-form formula | O(n) → O(1) |
| Repeated exponentiation, linear recurrences | Fast exponentiation, matrix exponentiation | O(n) → O(log n) |
| Divide work into independent halves | Divide and conquer | O(n²) → O(n log n) in many cases |

### Strings

| Signal | Technique | Typical result |
|---|---|---|
| String concatenation in a loop | Builder or join | O(n²) → O(n) |
| Substring search with long patterns or many searches | KMP, Z-algorithm, or the platform's optimized search | O(n·m) → O(n + m) |
| Comparing many substrings | Rolling hash (Rabin-Karp) with collision check | O(n·m) → O(n) average |
| Anagram or character-frequency checks | Fixed-size count array | Sorting O(n log n) → O(n) |
| Many patterns against one text | Aho-Corasick (often a dependency) | O(n·p) → O(n + total pattern length + matches) |

### I/O, database, network, UI

| Signal | Technique | Typical result |
|---|---|---|
| Query inside a loop (N+1) | One query with `IN`, a join, or batch fetch | n round trips → 1 |
| Network calls in a sequential loop | Batch endpoint, or bounded concurrency | n × latency → about 1 × latency (behavior trap: ordering, errors, rate limits) |
| Same data fetched or parsed repeatedly | Cache with bound and invalidation; parse once | Repeated cost → once |
| Heavy work on the main/UI thread | Move off-thread; precompute; cache derived values | Frame drops → smooth |
| Recomputing derived UI state every frame or render | Memoize on inputs (`remember`, `useMemo`, computed properties) | Per-frame cost → per-change cost |
| Full list refresh for a small change | Diffing or targeted updates | O(n) redraw → O(changes) |

## Bit manipulation

Mobile and app code rarely reaches for bits, but they win cleanly in specific cases. Use them when they reduce complexity or replace a heavier structure, and comment every non-obvious expression. Expressions below use C-style operators; each language file gives the exact syntax (Kotlin uses `and`, `or`, `xor`, `shl`, `inv()`).

| Use | How | When it helps |
|---|---|---|
| Small set of flags (permissions, features, states) | One `Int` or `Long` as a bitmask; `OptionSet` in Swift; `EnumSet` in Java; `[Flags]` enum in C# | Set operations become single O(1) instructions; no allocation |
| Set of integers in a known small range | Bitset (`BitSet`, `BitArray`, or an array of words) | Membership, union, intersection in O(n/64) instead of hashing |
| Test, set, clear, toggle bit i | `x & (1 << i)`, `x \| (1 << i)`, `x & ~(1 << i)`, `x ^ (1 << i)` | O(1) state checks |
| Count set bits | Built-in popcount (see language files) | O(1) hardware instruction instead of a loop |
| Lowest set bit | `x & -x`; trailing-zero count | Iterate only set bits: O(set bits) instead of O(width) |
| Power of two check | `x > 0 && (x & (x - 1)) == 0` | O(1) |
| Find the unique element when all others appear twice | XOR of all elements | O(n) time, O(1) space |
| Enumerate all subsets of a small set | Iterate masks 0 until 2^n | Simpler and faster than recursive subset generation |
| Subset DP (assignments, small TSP) | DP indexed by bitmask | O(n!) → O(2^n · n²) |
| Packing several small fields into one key | Shifts and masks into a `Long` | Composite hash keys without allocating pair objects |

Watch for: signed shifts versus unsigned shifts, integer width (JavaScript bitwise operators work on 32-bit signed integers), overflow when shifting by the full width, and readability. See the language files for exact operators.

## Combinations

The best solution often connects two techniques. Check these whenever a problem has two dimensions (for example, order and lookup).

| Combination | Solves | Result |
|---|---|---|
| Hash map + prefix sum | Count or find subarrays with a given sum or property | O(n²) → O(n) |
| Sort + two pointers | Pair/triple sums, closest pairs, merging | O(n²) or O(n³) → O(n log n) or O(n²) |
| Sort + binary search | Many lookups against a fixed collection when hashing is not possible (ranges, nearest value) | O(n·m) → O((n + m) log n) |
| Binary search on the answer + greedy check | Minimize the maximum, capacity planning, splitting into groups | Brute force → O(n log range) |
| Heap + hash map | LRU/LFU caches, Dijkstra with decrease-key, top-k frequent | O(n) operations → O(log n) or O(1) |
| Monotonic deque + sliding window | Window maximum/minimum, DP with window constraints | O(n·k) → O(n) |
| Sort + union-find | Kruskal MST, grouping by thresholds offline | O(n²) → O(n log n) |
| Trie + DFS | Word search in a grid, prefix enumeration | Per-word search → shared prefix search |
| DP + bitmask | Small-set assignment and ordering problems | Factorial → exponential with small base |
| DP + binary search | Longest increasing subsequence | O(n²) → O(n log n) |
| Prefix sums + binary search | Weighted random choice, "first index where cumulative total exceeds x" | O(n) per query → O(log n) |
| Hash map + doubly linked list | O(1) ordered cache with eviction | Bounded memory and O(1) operations |
| Sweep line + heap | Meeting rooms, skyline, interval scheduling with resources | O(n²) → O(n log n) |
| Coordinate compression + Fenwick tree | Counting inversions, rank queries over large value ranges | O(n²) → O(n log n) |

## When the best technique is not available

If the best approach needs a structure the standard library lacks (for example, a heap in JavaScript, a deque in Swift, a sorted map in Kotlin Multiplatform common code):

1. Prefer a small, well-tested implementation inside the project when it is short (a binary heap is about 40 lines). Give it its own unit tests.
2. If a robust implementation is large or subtle (balanced trees, Aho-Corasick), propose the dependency to the developer with its name, version, license, size, and what it buys, and wait for permission.
3. Report the best approach available without the dependency as the fallback.
