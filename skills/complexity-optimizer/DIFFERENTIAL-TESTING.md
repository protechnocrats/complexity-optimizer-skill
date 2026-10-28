# Differential Testing

A differential test runs the original implementation and the optimized implementation on the same inputs and asserts that every observable result is identical. It is the proof required by rule 3. Write it before changing the code, and run it against the unchanged code first.

## Setup

1. **Copy the original verbatim into test code** as a reference implementation, for example `legacyFindDuplicates` or `ReferenceImpl.findDuplicates`. Do not tidy it, fix it, or change its types. It lives only in test sources, never in production code.
2. **Call the production function** as the candidate. Before the optimization, the candidate and the reference are the same code, so the tests must pass; this proves the harness works.
3. **Keep the reference until the developer decides.** After the change is accepted, the developer may keep the differential test as a regression guard or delete the reference. Ask; do not decide for them.

If the original depends on collaborators (a repository, a clock, a network client), give both versions the same fakes, and record every call each version makes so calls can be compared.

## What to compare

Compare all of these, not only the return value:

- **Return value**, including element order, duplicates, nullability, and the concrete collection type when callers can observe it (mutable versus read-only, list versus lazy sequence).
- **Input mutation.** Snapshot every input before the call (deep copy) and compare the input after the call for both versions.
- **Exceptions.** Same exception type, and the same message when callers or logs depend on it. Same behavior on null, empty, and invalid input.
- **Side effects.** Calls to collaborators: which ones, with what arguments, how many times, and in what order. Writes, logs, events, and analytics.
- **State.** Any object or global state the function changes.
- **Laziness and short-circuiting.** If the original stops early (for example, `any`, `first`, a `break`), the candidate must not evaluate more elements when evaluation has side effects or can throw.

Floating-point results must match exactly unless the developer approves a tolerance. Reordering additions changes results.

## Inputs

Use both hand-written edge cases and generated inputs.

### Edge cases (always)

- Empty input, one element, two elements.
- All elements equal; all distinct; many duplicates.
- Already sorted, reverse sorted, nearly sorted.
- Negative values, zero, minimum and maximum values of the type, values that overflow when combined.
- Null elements or null input where the type allows it.
- Strings: empty string, whitespace, mixed case, non-ASCII, emoji and other characters outside the basic multilingual plane, combining characters.
- Ties for any ordering or "first match" logic.
- Inputs at and around every threshold, boundary, or special case visible in the original code.

### Generated inputs (always)

- Use a fixed random seed so failures reproduce. Print the seed and the failing input on failure.
- Generate many cases (at least 1,000 when the reference is fast enough), across a spread of sizes from 0 up to the largest size the reference can handle quickly.
- Bias the generator toward collisions: small value ranges produce duplicates and ties, which is where rewrites most often break.
- If the project already has a property-based testing library, use it and its shrinking. Do not add one without asking. A hand-written seeded generator is enough and needs no dependency.

## When equivalence counts as proven

Treat an optimization as proven equivalent only when all of these hold:

1. Differential tests cover every observable listed above that applies to the function.
2. Edge cases and generated inputs both pass.
3. The existing test suite passes.
4. Every trap in `BEHAVIOR-TRAPS.md` that could apply is either covered by a test or ruled out by analysis you can state in one sentence.

If any part cannot be tested (thread interleavings, real database ordering, platform rendering, timing, hardware), it is not proven. Follow rule 5: ask the developer, and if they accept, add the `NEEDS-TESTING` marker from `REPORTING.md`.

## Benchmarks

Benchmarks are evidence of speed, not of correctness, and they never replace differential tests.

- Use the project's existing benchmark tooling when present (see the language files). Otherwise write a simple timing harness in test code: warm up, run many iterations, report the median, and keep the result in a variable the compiler cannot discard.
- Measure the reference and the candidate at realistic `n` and at a larger `n` (for example, 10× realistic) to show the growth difference.
- Use the same inputs for both versions.
- Record machine and runtime details with the numbers. JIT, garbage collection, and debug builds distort results; prefer release builds and repeated runs.
- Do not commit benchmark harnesses into production code. Keep them in test or benchmark sources if the developer wants them.

## Testing a new data structure

When the optimization introduces a structure written inside the project (a heap, a deque, a bitset), give the structure its own unit tests in addition to the differential test of the function that uses it. Include a differential test of the structure against a simple, obviously correct model (for example, a heap against a sorted list) on generated operation sequences.
