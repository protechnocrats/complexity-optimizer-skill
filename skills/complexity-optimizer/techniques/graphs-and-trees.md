# Graphs and Trees

Part of the advanced techniques. The shared rules in `ADVANCED-TECHNIQUES.md` apply to every table in this file; read them first. Tables are read as described there.

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

## Combinations

| Combination | Solves | Result |
|---|---|---|
| Euler tour + range structure | Subtree sums, counts, or updates | Per-query traversal → O(log n) |
| Tree DP + rerooting | An answer for every root | O(n²) → O(n) |
| Euler tour + sparse table | Lowest common ancestor queries | O(1) per query after O(n log n) setup |
| Offline sorting + union-find | Connectivity queries under thresholds | Repeated traversal → sorted processing |
| Heavy-light decomposition + segment tree | Path queries and updates on trees | O(n) per query → O(log² n) |
