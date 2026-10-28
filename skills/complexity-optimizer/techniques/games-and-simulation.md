# Games and Real-Time Simulation

Part of the advanced techniques. The shared rules in `ADVANCED-TECHNIQUES.md` apply to every table in this file; read them first. Tables are read as described there.

## Games and real-time simulation

A frame has a fixed budget (16.7 ms at 60 frames per second), so the worst frame matters more than the average: measure frame-time percentiles and spikes, not only means. Games that rely on determinism (lockstep multiplayer, replays) must produce identical results on every machine: see "Simulation and games" in `BEHAVIOR-TRAPS.md`. Spatial queries and broad-phase collision are under "Spatial data" in `techniques/spatial-data.md`; ray casts and visibility use the BVH under "Computational geometry and CAD" in `techniques/geometry-and-cad.md`.

| Signal | Technique | Valid when | Typical result |
|---|---|---|---|
| Many agents each finding a path to the same goal | Flow field: one Dijkstra or BFS outward from the goal, then each agent follows the cheapest neighbor | Agents share the goal and the cost map; among equal-cost paths, agents may pick different ones (behavior change if observable) | A searches per goal → one search per goal change |
| Pathfinding on a large uniform-cost grid | Jump point search | Uniform costs and the original movement rules (diagonals, corner cutting); optimal length, but may choose a different path among equals | Same optimal length with far fewer nodes expanded |
| Pathfinding over large maps, repeated often | Hierarchical pathfinding (HPA*), navigation meshes, or precomputed portal graphs | **HPA* paths can be slightly longer than optimal: behavior change** | Large practical reduction in search work |
| Every object's world transform recomputed every frame | Dirty flags on the transform hierarchy: recompute only the subtrees that changed | Every change marks its node | O(all nodes) → O(changed nodes) per frame |
| Every object updated or polled every frame although few change | Event-driven updates, timers (timing wheel), sleeping physics bodies | Update order and the timing of effects are preserved, or the change is approved | Work proportional to active objects |
| Every object drawn or tested for visibility each frame | Frustum culling over a BVH or grid; occlusion culling | Culling is conservative: it never removes a visible object | O(objects) → about O(log n + visible objects) |
| Distant objects rendered or simulated at full detail | Level of detail (LOD) for meshes, animation, and simulation | **Changes what is rendered or simulated: behavior change**, developer review | Work roughly proportional to screen-space importance |
| Narrow-phase collision between convex shapes by testing all pairs of features | Separating axis theorem, or GJK with EPA for penetration depth | Same contact results; a changed tolerance is a behavior change | Feature pairs O(n·m) → about O(n + m) |
| Allocation, garbage collection, or asset loading during gameplay | Object pools, preallocated buffers, asynchronous asset streaming | Pooled objects are fully reset before reuse | Removes frame-time spikes |
| Game objects with their data scattered across memory | Entity-component-system storage: each component type in a contiguous array | See "Memory locality" in `techniques/hardware-and-concurrency.md` | Fewer cache misses per frame |
| Assets, events, or properties looked up by string name during frames | Hash names to integer IDs once at load time | IDs are unique; collisions detected at load time | String hashing and comparison removed from frames |
