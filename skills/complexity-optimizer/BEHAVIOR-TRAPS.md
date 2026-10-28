# Behavior Traps

Rewrites that look equivalent but are not. Walk this list for every candidate in Phase 3 and again after applying a change. Each applicable trap must be covered by a differential test or ruled out with a stated reason. Language-specific traps are in the `languages/` files.

## Ordering

- **Iteration order of hash structures.** Replacing a list with a hash set or hash map, or an insertion-ordered map with an unordered one, changes the order callers see. Some platforms randomize hash order per process (Swift), so a test can pass once and fail later. Preserve order with an insertion-ordered structure, or keep the original list for output and use the hash structure only for lookups.
- **Sort stability.** Switching between a stable and an unstable sort changes the relative order of equal elements. Check which sorts are stable in the language file.
- **Ties.** "First match," "max by," and "min by" may pick a different element among equals after a rewrite.
- **Order of side effects.** Batching, parallelizing, or reordering loops changes the order of writes, logs, events, and callbacks.

## Equality and keys

- **Equality semantics change.** A linear search with `==` or a custom comparison may not match the hash structure's equality (`equals`/`hashCode`, `Hashable`, `IEquatable`, JavaScript SameValueZero, reference equality for objects).
- **Inconsistent `equals` and `hashCode`.** Types that override one but not the other behave correctly in a list scan but break in a hash set.
- **Mutable keys.** An object used as a hash key and mutated afterward can no longer be found.
- **Case, culture, and normalization.** String comparisons that ignore case or depend on locale must use the same comparer in the new structure.
- **Floating-point keys.** `NaN`, `-0.0` versus `0.0`, and rounding make float keys unsafe in hash structures.

## Duplicates and nulls

- **Duplicates collapse.** Converting a list to a set removes duplicates; maps overwrite or throw on duplicate keys depending on the method used.
- **Null handling.** Some structures reject null keys or values; others accept them. A lookup that returned "not found" may now throw, or the reverse.

## Mutation and aliasing

- **Input mutation.** In-place algorithms (sorting the caller's list, removing during iteration) change the caller's data where the original did not, or the reverse.
- **Returned collections.** Returning an internal buffer, a view, or a mutable collection where the original returned a fresh copy lets callers mutate shared state.
- **Copy-on-write and value semantics.** Changes to when copies occur can change both performance and which copy a caller sees.

## Laziness, short-circuiting, and evaluation

- **Eager versus lazy.** Switching between eager collections and lazy sequences or iterators changes when (and whether) element functions run, which matters when they have side effects, throw, or read changing state.
- **Short-circuiting lost.** A precomputed index built from all elements evaluates elements the original never touched, possibly throwing or doing extra I/O.
- **Deferred queries.** Lazy query objects (LINQ, ORM query builders) re-execute on every enumeration; caching or materializing them changes when the data is read.

## Numbers

- **Overflow.** A closed-form formula or a different summation order can overflow where the loop did not, or the reverse. Some languages wrap silently, others trap or crash.
- **Floating-point association.** `(a + b) + c` is not `a + (b + c)`. Prefix sums, reordering, and parallel reduction change results.
- **Integer division and rounding.** Rewritten arithmetic can round differently.
- **Bit manipulation width.** Shifts beyond the type width, signed versus unsigned shifts, and 32-bit limits in some runtimes.

## Strings and text

- **Length and indexing units.** UTF-16 code units, Unicode scalars, and grapheme clusters give different lengths and indices.
- **Locale-sensitive operations.** Case conversion and comparison that depend on the current locale.

## Purity and caching

- **Memoizing an impure function.** If the function reads time, randomness, mutable state, configuration, the database, or the network, a cache returns stale results.
- **Cache invalidation.** A cache must be invalidated whenever any input it depends on changes.
- **Bounded caches evict.** Eviction changes which calls hit the slow path; that is fine only if the function is pure.

## Concurrency

- **Thread safety.** Replacing a synchronized or concurrent structure with an unsynchronized one, or adding shared mutable caches, introduces races.
- **Iterator invalidation.** Modifying a collection while iterating it throws or skips elements, depending on the platform.
- **Changed concurrency.** Running previously sequential work concurrently changes ordering, error behavior (fail-fast versus continue), rate limiting, and resource usage.

## Errors and limits

- **Different exceptions.** A new structure may throw a different exception type, at a different point, or not at all.
- **Recursion depth.** Turning iteration into recursion (or the reverse) changes stack overflow behavior on large inputs.
- **Resource limits.** A faster algorithm that uses more memory may hit OOM where the original did not (rule 1: memory must stay bounded).

## I/O and databases

- **Query count and transactions.** Batching queries changes transaction boundaries, locking, and what a concurrent writer can interleave.
- **Result order.** A database returns rows in no guaranteed order without `ORDER BY`; a batched `IN` query may order results differently from per-item queries.
- **Partial failure.** One failed item in a batch may fail the whole batch where the loop processed the others.

## Public contract

- **Signature, return type, nullability, mutability, and threading guarantees** must stay the same unless the developer approves the change (rule 11).
