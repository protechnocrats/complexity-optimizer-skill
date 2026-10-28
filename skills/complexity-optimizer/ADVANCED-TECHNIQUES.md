# Advanced Techniques

Load this file in Phase 3 alongside `ALGORITHM-ARSENAL.md` when:

- the core techniques do not reach the lower bound, or
- the problem is about graphs, trees, dynamic programming, combinatorial search, strings, number theory, numerical computation, or specialized data structures.

These techniques apply to any codebase: compilers, databases, search engines, scientific and financial code, games, infrastructure tooling, backends, and apps. Every rule still applies. In particular:

- **Assumptions decide validity.** Each technique below has strict preconditions. Confirm each one from the code and record the evidence.
- **Most need an implementation inside the project.** Standard libraries rarely include them. Write a focused implementation with its own tests (see "Testing a new data structure" in `DIFFERENTIAL-TESTING.md`) and a comment naming the technique and its complexity (rule 13). If a well-tested library is the better route, ask first (rule 7).
- **Approximate and probabilistic techniques change results.** They are always behavior changes and need developer review (rule 5).
- **Constant factors matter.** Several techniques win only at large sizes. Benchmark at realistic sizes (rule 8).

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
| DP transition takes the min/max over a sliding range of previous states | Monotonic deque | The range of candidate states slides monotonically | O(n·k) → O(n) |
| Transition minimizes a linear function of earlier states (dp[j] + a[i]·b[j]) | Convex hull trick or Li Chao tree | The transition has that exact linear form | O(n²) → O(n log n), or O(n) with monotonic slopes and queries |
| Optimal split point moves monotonically as i grows | Divide-and-conquer optimization | Monotonicity of the optimal split point is proven | O(k·n²) → O(k·n log n) |
| Interval DP where cost satisfies the quadrangle inequality | Knuth optimization | Quadrangle inequality and monotonicity hold | O(n³) → O(n²) |
| Optimal segmentation or partitioning | Interval DP, partition DP, prefix DP | — | Exhaustive partition enumeration → polynomial |
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
| Many substring or repeated-pattern queries on a static text | Suffix array + LCP array | Text does not change | Per-query scans → O(m log n) per query; O(n log n) build (O(n) with SA-IS) |
| Distinct substrings, longest repeated or common substring | Suffix automaton | — | O(n²) or worse → O(n) build |
| Longest palindromic substring, all palindromes | Manacher's algorithm | — | O(n²) → O(n) |
| Border and period detection | Prefix function (KMP failure function) | — | O(n²) → O(n) |
| Edit distance when only small distances matter | Banded (Ukkonen) edit distance | A threshold k is known | O(n·m) → O(n·k) |

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
| Polynomial multiplication, convolution, counting pair sums | FFT or NTT | Floating-point FFT can change results through rounding (behavior change); NTT is exact modulo a suitable prime | O(n²) → O(n log n) |
| XOR constraints, parity systems, maximum subset XOR | XOR basis; Gaussian elimination over GF(2) | — | Exponential subset search → O(n · bits), or O(n³/w) with bitsets |

## Specialized data structures

| Signal | Technique | Valid when | Typical result |
|---|---|---|---|
| Predecessor and successor queries over a bounded integer universe u, at very high volume | Van Emde Boas tree, or a hierarchical bitset (y-fast trie for sparse sets) | Integer keys in [0, u); memory O(u) for van Emde Boas, less for hierarchical bitsets | O(log n) → O(log log u) |
| Sorted map needed but not in the standard library | Treap, skip list, or another balanced tree | — | O(n) → O(log n) expected |
| Overlap queries over many intervals | Interval tree, or a segment tree over compressed coordinates | — | O(n) per query → O(log n + k) |
| Nearest-neighbor or range search in low dimensions | k-d tree | Low dimensionality (roughly under 10); data mostly static | O(n) per query → O(log n) average |
| Cheap pre-check before an expensive exact lookup | Bloom filter | Used **only as a pre-filter** before the exact check, so false positives never change results | Avoids most expensive lookups |
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
