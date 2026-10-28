# Kotlin

Load this file for Kotlin projects. On Kotlin/JVM and Android, every `java.util` structure is also available, and `JAVA.md` documents them; consult it only for structures Kotlin does not provide.

First determine the target: **Kotlin/JVM or Android** (full Java standard library), or **Kotlin Multiplatform common code** (only `kotlin.collections`; no `TreeMap`, `PriorityQueue`, `BitSet`, or `java.util.*`).

## Kotlin first (rule 14)

When Kotlin provides an equivalent, use the Kotlin structure or factory, not the Java class:

| Need | Use (Kotlin) | Instead of (Java) |
|---|---|---|
| Queue, stack, deque | `ArrayDeque` (`kotlin.collections`) | `java.util.ArrayDeque`, `LinkedList`, `Stack` |
| Dynamic list | `mutableListOf()`, `buildList { }`, `ArrayList` from `kotlin.collections` | `java.util.ArrayList()` imported from `java.util` |
| Hash map / set | `hashMapOf()`, `hashSetOf()`, `toHashSet()` | `java.util.HashMap()`, `java.util.HashSet()` |
| Insertion-ordered map / set | `mutableMapOf()`, `linkedMapOf()`, `mutableSetOf()`, `buildMap { }` | `java.util.LinkedHashMap()`, `java.util.LinkedHashSet()` |
| Sorted map / set | `sortedMapOf()`, `sortedSetOf()`, `toSortedMap()` | `java.util.TreeMap()`, `java.util.TreeSet()` |
| Primitive arrays | `IntArray`, `LongArray`, ... | `java.util.Arrays` helpers where Kotlin extensions exist (`sort()`, `binarySearch()`, `fill()`, `copyOf()`) |
| Sorting and searching lists | `sort()`, `sortBy { }`, `sortedWith()`, `binarySearch()` | `Collections.sort`, `Collections.binarySearch` |
| Read-only views | `List`, `Map`, `Set` interfaces | `Collections.unmodifiableList` |
| String building | `buildString { }`, `joinToString()` | `java.lang.StringBuilder` used directly (acceptable inside `buildString`) |
| Random numbers | `kotlin.random.Random` | `java.util.Random` |

Use Java classes only when Kotlin has no equivalent, and state this in the report:

- `java.util.PriorityQueue` (no Kotlin heap)
- `java.util.BitSet`, `EnumSet`, `EnumMap`
- `TreeMap`/`TreeSet` navigation (`floorKey`, `ceilingKey`, `headMap`, `pollFirst`): `sortedMapOf` returns a `SortedMap`, which lacks these, so declare a `java.util.TreeMap` or `NavigableMap` when navigation is needed
- `LinkedHashMap` with access order and `removeEldestEntry` for a bounded LRU cache (Android also has `android.util.LruCache`)
- `java.util.concurrent` collections

Only new code follows this preference. Do not replace existing Java structures just to make them Kotlin-native. Behavior can differ: for example, `java.util.ArrayDeque` throws on `null` elements while Kotlin's `ArrayDeque` accepts them.

## Built-in structures

| Structure | Kotlin API | Key costs | Notes |
|---|---|---|---|
| Dynamic array | `mutableListOf`, `ArrayList` | get/set O(1), append amortized O(1), insert/remove at front O(n), `contains` O(n) | `listOf` returns a read-only list, not an immutable one |
| Hash set | `hashSetOf`, `HashSet` | add/contains/remove O(1) average | No iteration-order guarantee |
| Insertion-ordered set | `mutableSetOf`, `setOf`, `LinkedHashSet` | O(1) average | **`mutableSetOf` is a `LinkedHashSet`**, not a `HashSet` |
| Hash map | `hashMapOf`, `HashMap` | O(1) average | No order guarantee |
| Insertion-ordered map | `mutableMapOf`, `mapOf`, `LinkedHashMap` | O(1) average | **`mutableMapOf` is a `LinkedHashMap`** |
| Double-ended queue | `kotlin.collections.ArrayDeque` | add/remove at both ends O(1) amortized, indexed get O(1) | Available in common code; use it for queues and BFS |
| Sorted set / map | `sortedSetOf`, `sortedMapOf` (`TreeSet`, `TreeMap`) | O(log n) | JVM only |
| Priority queue | `java.util.PriorityQueue` | offer/poll O(log n), peek O(1) | JVM only |
| Primitive arrays | `IntArray`, `LongArray`, `BooleanArray`, `CharArray`, `DoubleArray` | O(1) access, no boxing | Prefer over `List<Int>` in hot numeric code |
| Bitset | `java.util.BitSet` | O(1) per bit, O(n/64) bulk ops | JVM only |
| Enum set / map | `EnumSet`, `EnumMap` | O(1), bit-vector backed | JVM only |
| String builder | `buildString { }`, `StringBuilder` | append amortized O(1) | |
| Lazy pipeline | `asSequence()` | Avoids intermediate lists | Changes evaluation order (see traps) |

### Android-specific structures

`SparseArray`, `SparseIntArray`, `SparseBooleanArray`, `LongSparseArray`, and `ArrayMap` avoid boxing and use less memory, but lookups are binary search, **O(log n)**, and insertion is O(n). By rule 2, do not replace a `HashMap` with one of these to save memory when it makes lookups slower. They are a good choice only for small collections (hundreds of entries) where a benchmark shows they are at least as fast. Do not apply Android Lint's "use SparseArray" suggestion blindly.

### Not in common code (Multiplatform)

No sorted map/set, priority queue, or bitset in `kotlin.collections`. Options: `expect`/`actual` wrappers over platform types, a small in-project implementation with tests, or a dependency (ask first, rule 7).

## Hidden costs

| Pattern | Cost | Fix |
|---|---|---|
| `result = result + item` or `list += item` on a read-only `var list: List<T>` in a loop | Each step copies the list: O(n²) | `mutableListOf` and `add`, or `buildList { }` |
| `if (item in list)` inside a loop | O(n) per check | Build a `HashSet` once (`toHashSet()`), preserving order separately if needed |
| `list.first { it.id == x }` or `find` inside a loop | O(n) per lookup | `associateBy { it.id }` once (note: last duplicate wins) |
| `list.removeAt(0)` on an `ArrayList` as a queue | O(n) per removal | `ArrayDeque.removeFirst()` |
| `sortedBy` or `sorted()` inside a loop | O(n log n) per iteration | Sort once outside, or maintain a `TreeMap`/heap |
| Long chains of `map`/`filter`/`flatMap` on large lists | One intermediate list per step | `asSequence()` (check laziness trap) or a single loop |
| `filter { }.size`, `filter { }.isNotEmpty()` | Allocates a filtered list | `count { }`, `any { }` |
| `string += x` in a loop | O(n²) character copying | `buildString { }` or `joinToString` |
| `Regex("...")` or `toRegex()` inside a loop or hot function | Recompiles the pattern each time | Hoist to a `val` in a companion or top level |
| `List<Int>`, `Map<Int, Int>`, `Set<Long>` in hot numeric code | Boxing, poor cache locality, GC pressure | `IntArray`, primitive counting arrays, or bitsets |
| `distinct()` then `contains` | Fine for one call; wasteful if repeated | Keep the set |
| `subList` on a list that is later modified | `ConcurrentModificationException` or stale views | Copy only when needed |

## Android performance hot spots

- **Main thread.** Anything over a few milliseconds on the main thread is a time problem regardless of Big-O. Move it to `Dispatchers.Default` (CPU) or `Dispatchers.IO` (I/O) only if the call is already asynchronous, or ask before changing threading (rule 11).
- **Jetpack Compose.** Expensive computation in a composable runs on every recomposition. Use `remember(keys) { }` for derived values and `derivedStateOf` for values derived from frequently changing state. Provide stable `key`s in `LazyColumn` items.
- **Views.** No allocation or heavy work in `onDraw`, `onMeasure`, `onLayout`, or `onBindViewHolder`. Use `DiffUtil`/`ListAdapter` instead of `notifyDataSetChanged()`.
- **Room and SQLite.** Queries inside loops (N+1): replace with one query using `IN (:ids)`, a `@Relation`, or a join. Add indexes for filtered and joined columns; that is a schema change, so ask.
- **Coroutines and Flow.** Sequential `await` in a loop can become `awaitAll`, but that changes ordering of side effects, error behavior, and concurrency (behavior trap); ask first.

## Bit manipulation

| Operation | Kotlin |
|---|---|
| And, or, xor, not | `a and b`, `a or b`, `a xor b`, `a.inv()` |
| Shift left, arithmetic right, logical right | `a shl n`, `a shr n`, `a ushr n` |
| Popcount | `x.countOneBits()` |
| Trailing / leading zeros | `x.countTrailingZeroBits()`, `x.countLeadingZeroBits()` |
| Lowest / highest set bit | `x.takeLowestOneBit()`, `x.takeHighestOneBit()` |
| 64 flags | `Long` with `1L shl i` (using `1 shl i` with `Int` silently overflows at 32) |

Shifts use only the low 5 bits (`Int`) or 6 bits (`Long`) of the shift count, so `1 shl 32 == 1`. For flag sets with an enum, `EnumSet` is usually clearer than a raw mask on the JVM.

## Kotlin-specific traps

- **`mutableSetOf`/`mutableMapOf` preserve insertion order.** Replacing them with `HashSet`/`HashMap` changes iteration order.
- **`associateBy` and `toMap` keep the last value for duplicate keys;** a `first { }` search returned the first.
- **`groupBy` returns a `LinkedHashMap`** in first-key-appearance order.
- **`sortedBy`, `sortedWith`, and `sort` on lists are stable** (they use the JVM's stable object sort). `IntArray.sort()` sorts primitives, where stability is not observable.
- **Sequences are lazy.** `asSequence()` evaluates element by element, interleaving `map` and `filter` lambdas, and evaluates nothing until a terminal operation. This changes the order and number of lambda calls when they have side effects.
- **Structural versus reference equality.** `==` calls `equals`; `===` compares references. A `data class` with `var` properties used as a hash key breaks when mutated.
- **Silent `Int` overflow.** Arithmetic wraps without error; a closed-form formula may overflow where an incremental loop did not. Use `Long` or `Math.multiplyExact` when the original never overflowed in practice and the new form might.
- **Read-only is not immutable.** `listOf` results can be cast or may be backed by a mutable list; returning an internal `MutableList` typed as `List` lets Java callers mutate it.

## Testing and benchmarking

- **Tests:** JUnit 4 or 5, `kotlin.test`, Kotest; Robolectric for Android framework code; Turbine for Flow.
- **Property-based testing, if already present:** Kotest property testing (`kotest-property`), jqwik.
- **Benchmarks, if already present:** Jetpack Microbenchmark (`androidx.benchmark`) on device, kotlinx-benchmark or JMH on the JVM. Otherwise use a timing harness in test code with `System.nanoTime()` and warmup iterations, and note that JIT and debug builds distort results.
