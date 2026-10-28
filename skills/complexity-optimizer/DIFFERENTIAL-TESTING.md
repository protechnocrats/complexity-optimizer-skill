# Differential Testing

A differential test runs the original implementation and the optimized implementation on the same inputs and asserts that every observable result is identical. It is the evidence required by rule 3. Write it before changing the code, and run it against the unchanged code first.

Passing differential tests are strong evidence, not proof. They show equivalence on the inputs that ran, not on every possible input. Never describe an optimization as proven equivalent; report what was verified and what was not (see "Reporting verification" below).

## Setup

1. **Copy the original verbatim into test code** as a reference implementation, for example `legacyFindDuplicates` or `ReferenceImpl.findDuplicates`. Do not tidy it, fix it, or change its types. It lives only in test sources, never in production code.
2. **Call the production function** as the candidate. Before the optimization, the candidate and the reference are the same code, so the tests must pass; this shows the harness works.
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
- Floating point: NaN, positive and negative infinity, `0.0` and `-0.0`, subnormal values, very large and very small magnitudes, and values that are nearly equal (to expose cancellation).
- Null elements or null input where the type allows it.
- Strings: empty string, whitespace, mixed case, non-ASCII, emoji and other characters outside the basic multilingual plane, combining characters.
- Ties for any ordering or "first match" logic.
- Inputs at and around every threshold, boundary, or special case visible in the original code.
- Malformed or unexpected input the function can receive (invalid formats, out-of-range values, inconsistent state), when callers can pass it.

### Generated inputs (always)

- Use a fixed random seed so failures reproduce. Print the seed and the failing input on failure.
- Generate many cases (at least 1,000 when the reference is fast enough), across a spread of sizes from 0 up to the largest size the reference can handle quickly.
- Bias the generator toward collisions: small value ranges produce duplicates and ties, which is where rewrites most often break.
- If the project already has a property-based testing library, use it and its shrinking. Do not add one without asking. A hand-written seeded generator is enough and needs no dependency.

### Exhaustive inputs (when the domain is small)

When every input in a small domain can be enumerated in reasonable time, test all of them instead of sampling: for example, every array of length 0 to 6 over the values 0 to 3, every 8-bit or 16-bit input to a bit-manipulation or encoding routine, or every 32-bit input to a fast pure function. Keep the generated inputs as well, for sizes beyond the exhaustive domain. Report the exact domain covered: an exhaustive pass shows equivalence on that domain only, not on larger inputs.

## When equivalence counts as verified

Treat an optimization as verified by tests only when all of these hold:

1. Differential tests cover every observable listed above that applies to the function.
2. Edge cases and generated inputs both pass.
3. The existing test suite passes, run on the final version of the code.
4. Every trap in `BEHAVIOR-TRAPS.md` that could apply is either covered by a test or ruled out by analysis you can state in one sentence.

If any part cannot be tested (thread interleavings, real database ordering, platform rendering, timing, hardware), it is not verified. Follow rule 5: ask the developer, and if they accept, add the `NEEDS-TESTING` marker from `REPORTING.md`. If a differential test shows that the outputs differ and the difference is intended, it is a behavior change, not a test to relax: document it for review and use the `BEHAVIOR-CHANGE` marker only after approval.

## Reporting verification

For every applied item, report:

- **Inputs and properties covered:** the edge-case categories, the number of generated cases, the seeds, the size range, and which observables were compared (return value, input mutation, exceptions, side effects, order).
- **Tests and tools actually run:** the commands or test names, and their results. Report only what actually ran.
- **Unverified behavior:** anything the tests could not cover, and why.

If tests could not be run at all (no test framework, an environment that cannot execute them, a timeout), say so. The item is then unverified: follow rule 5, and do not present it as a confirmed win.

## Benchmarks

Benchmarks are evidence of speed, not of correctness, and they never replace differential tests.

- Use the project's existing benchmark tooling when present (see the language files). Otherwise write a simple timing harness in test code: warm up, run many iterations, report the median, and keep the result in a variable the compiler cannot discard.
- Measure the reference and the candidate at realistic `n` and at a larger `n` (for example, 10× realistic) to show the growth difference.
- Use the same inputs for both versions.
- Include worst-case and adversarial inputs where relevant: already-sorted or reverse-sorted data for sorting and selection, colliding hash keys for hash-based structures, deep or degenerate shapes for trees and recursion.
- Warm up where the runtime has a JIT or caches. Run multiple times and report the median and the variance (or min and max), not a single run.
- Report absolute times together with percentage change. Percentages alone can make a tiny gain look large.
- Run the reference and the candidate in equivalent environments: same machine, same build type, same load.
- Record machine and runtime details with the numbers. JIT, garbage collection, and debug builds distort results; prefer release builds and repeated runs.
- Do not commit benchmark harnesses into production code. Keep them in test or benchmark sources if the developer wants them.
- Label every number as measured. Big-O improvements and workload estimates are labeled estimated and never presented as measured results.

## Memory measurement

Rule 1 requires memory to stay bounded, so measure it, not just time:

- **Peak memory** during the benchmark for both versions.
- **Allocation volume** (bytes or objects allocated), using the platform's allocation profiler or benchmark tool where available.
- **Retained memory** after the call returns, to catch caches or indexes that grow without bound.

If the platform offers no way to measure memory, state that, and report the expected memory bound as estimated.

## Testing a new data structure

When the optimization introduces a structure written inside the project (a heap, a deque, a bitset), give the structure its own unit tests in addition to the differential test of the function that uses it. Include a differential test of the structure against a simple, obviously correct model (for example, a heap against a sorted list) on generated operation sequences.
