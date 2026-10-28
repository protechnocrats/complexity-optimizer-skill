# Advanced Techniques

Load this file in Phase 3 alongside `ALGORITHM-ARSENAL.md` (or in write mode, step 4) when the core techniques do not reach the lower bound, or when the problem falls in one of the domains below. Then load only the domain files whose topics match. Load several when a problem spans domains (for example, a game's collision detection needs `techniques/spatial-data.md` and `techniques/games-and-simulation.md`). If no row matches but the core techniques fall short, scan the "Load when the problem involves" column again for the abstract problem from Phase 3, not the code's surface.

## Domain files

| File | Load when the problem involves |
|---|---|
| `techniques/graphs-and-trees.md` | Graphs, static or changing (shortest paths, connectivity, ordering, matching, flows, incremental recomputation over dependency graphs), and tree queries |
| `techniques/sequences-dp-search.md` | Range queries over arrays, dynamic programming that is still too slow, and exponential search (subsets, constraints, puzzles, scheduling) |
| `techniques/strings-and-text.md` | Substring and pattern search, palindromes, edit distance, regular expressions, and keyword search across documents |
| `techniques/math-and-numerics.md` | Primes, divisibility, modular arithmetic, recurrences, convolution, floating-point summation and accuracy, polynomials, linear systems, and sparse matrices |
| `techniques/machine-learning.md` | Data pipelines for models, training, inference, LLM serving and decoding, embeddings and retrieval, classical machine learning, and calls to model APIs |
| `techniques/images-and-signals.md` | Filters, convolution, blurs, morphology, per-pixel operations, color transforms, labeling, multi-scale images, video frames, and audio |
| `techniques/geometry-and-cad.md` | Convex hulls, segment intersection, point-in-polygon, ray casting, triangulation, meshes, polygon Booleans, curves, and geometric predicates |
| `techniques/games-and-simulation.md` | Per-frame work, pathfinding for many agents, transform hierarchies, culling, level of detail, narrow-phase collision, and frame-time spikes |
| `techniques/spatial-data.md` | Proximity, collision, range, and nearest-neighbor queries over points or shapes in 2D, 3D, or high dimensions (including embeddings) |
| `techniques/hardware-and-concurrency.md` | Cache misses, branch misses, data layout, SIMD, multithreading, parallel reductions, and lock contention |
| `techniques/data-at-scale.md` | Data larger than memory, fixed memory budgets, streaming aggregation, on-disk indexes, storage engines, file systems, and compressed integer sets |
| `techniques/data-structures.md` | Custom hash tables, cache eviction policies, Bloom and cuckoo filters, sketches, timing wheels, interval trees, and integer-universe structures |

## How to read the tables

Every domain file uses the same columns. Read them the same way as in `ALGORITHM-ARSENAL.md`: build or preprocessing cost is stated separately from per-query cost, output cost counts, bounds are worst case unless labeled expected, average, or amortized, and "in practice" marks workload-dependent speedups.

## Shared rules

These techniques apply to any codebase: operating system kernels, storage and database engines, file systems, compilers, search engines, machine learning and AI systems, image, video, and audio processing, CAD and geometry kernels, scientific and financial code, games and simulations, infrastructure tooling, backends, and apps. Every rule still applies. In particular:

- **Assumptions decide validity.** Each technique below has strict preconditions. Confirm each one from the code and record the evidence.
- **Most need an implementation inside the project.** Standard libraries rarely include them. Write a focused implementation with its own tests (see "Testing a new data structure" in `DIFFERENTIAL-TESTING.md`) and a comment naming the technique and its complexity (rule 13). If a well-tested library is the better route, ask first (rule 7).
- **Approximate results are always behavior changes.** Any technique whose answer can differ from the exact answer callers receive today (sketches, sampling, approximate nearest neighbor, probabilistic primality tests without a deterministic base set) needs developer review (rule 5). Randomized or probabilistic techniques whose final answer stays exact are not behavior changes on that account: a Bloom or cuckoo filter followed by the exact check, a hash match confirmed by direct comparison, randomized quickselect. Their randomness affects only running time; label those bounds as expected.
- **Constant factors matter.** Several techniques win only at large sizes. Benchmark at realistic sizes (rule 8).
- **A behavior change is a decision, not a disqualification.** When the best technique changes results (more accurate floating-point sums, a different eviction order, approximate answers), still report it with the exact behavior before and after, and let the developer decide (rule 5). Offer the best equivalent alternative next to it.
