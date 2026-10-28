# Workflow

Follow these phases in order. Report mode stops after Phase 4.

## Phase 1: Setup

1. Detect languages and versions as described in `SKILL.md`, then load the matching `languages/` files.
2. Identify the test framework, how tests are run, and whether a property-based testing library is already a dependency. Do not add one without asking.
3. Identify available benchmark tooling. If none exists, plan a simple in-test timing harness (see `DIFFERENTIAL-TESTING.md`) rather than adding a dependency.
4. Check version control state. In apply mode, recommend a dedicated branch and confirm the working tree is clean, or that the developer accepts mixing changes.
5. Run the existing test suite. Record pass/fail counts. If anything fails before you change code, report the failures and stop until the developer decides how to proceed. If there is no suite, or it cannot run here, follow rule 12.

## Phase 2: Survey

Find candidates. Prefer evidence over guessing:

- Profiler output, slow-trace logs, or a specific complaint from the developer come first.
- Then scan for structural signals: nested loops over the same or related collections (including triple-nested loops), recursion that branches more than once per call, enumeration of subsets or permutations, linear searches inside loops (`contains`, `indexOf`, `find`, `includes`), repeated sorting, removal from the front of arrays, string building in loops, recursion without memoization over overlapping subproblems, database or network calls inside loops, work repeated on every UI frame or recomposition.
- Use the "hidden costs" section of each loaded language file.

For each candidate, establish before analyzing it:

1. **What it computes.** Read the function and the functions it calls. Write one or two sentences of plain-language description.
2. **Who uses it.** Search all callers, including reflection, dependency injection, serialization, and UI bindings where relevant. Note public API exposure.
3. **How often and how large.** Estimate realistic `n` (and every other size variable) and call frequency from callers, data sources, UI limits, pagination, and tests. Write the assumption down.
4. **Cost along the call chain.** Multiply the function's cost by how many times its callers invoke it per operation: loops in callers, per-item callbacks, per-frame or per-request calls. A function that is optimal for a single call can be the inner loop of a cubic computation. When it is, analyze the caller as the candidate; the fix often belongs there (for example, build an index once, then look up) rather than in the function, which may stay unchanged.
5. **Hot or cold.** Main thread, per-frame, per-request, per-item, startup, or rare background work.

Drop candidates where `n` is provably tiny and the path is cold (rule 8 defines both), but list them in the report as "not worth changing" so the developer sees they were considered.

## Phase 3: Analyze

For each remaining candidate, record:

1. **Problem statement.** Restate the function as an abstract problem ("count pairs with sum k," "find the latest event per user," "check membership against a fixed list"). Abstract statements match known techniques.
2. **Current complexity.** Time and space, in every size variable, labeled worst, average, or amortized. Include hidden costs from library calls and from the project functions it calls, and the total cost along the call chain from Phase 2.
3. **Lower bound.** The best complexity any correct algorithm could achieve, with the reason. See "Lower bounds" in `ALGORITHM-ARSENAL.md`.
4. **Candidates.** From `ALGORITHM-ARSENAL.md` (and `ADVANCED-TECHNIQUES.md` when the core techniques do not reach the lower bound or the problem domain calls for it), in proportion to difficulty (rule 6). Straightforward: the strongest candidate plus a brief reason alternatives are unnecessary. Nontrivial: at least three plausible approaches, including at least one combination when the problem has more than one dimension (ordering plus lookup, range plus count, and so on). For each: time, space (preprocessing separately from per-query cost), the assumptions it needs and the evidence from the code that they hold, standard library or dependency, behavior risks.
5. **Choice.** The best approach and why. If it does not reach the lower bound, explain why the gap remains (for example, a better bound needs a dependency the developer has not approved, or needs preprocessing that the call pattern cannot amortize).
6. **Space check.** Only after time is optimal: can the chosen approach use less memory without changing its time complexity? Confirm every new cache or index is bounded.
7. **Behavior risks.** Walk `BEHAVIOR-TRAPS.md` and list every trap the change could hit.
8. **Verifiability.** Which observable behavior differential tests can cover, and which they cannot (concurrency, real database ordering, timing, platform rendering, numerical edge cases).
9. **Known behavior changes.** Any observable behavior the approach changes, even for the better. These go in the report's "Behavior changes for review" section and are never applied without explicit approval (rule 5).
10. **Bugs noticed.** Anything that looks wrong in the original. Record it for the bug log; do not fix it. Note whether the code will be optimized (rule 4): if not, it stays exactly as is; if so, note whether the chosen approach keeps the bug or removes it as a side effect.

## Phase 4: Report

Write the report defined in `REPORTING.md`. Rank items by expected real-world impact: hot path and large `n` first, then complexity gap, then risk.

In report mode, stop here and present the report. Ask which items to apply and raise any dependency requests.

## Phase 5: Apply

For each approved item, one at a time:

1. **Characterize the original.** Write differential tests per `DIFFERENTIAL-TESTING.md`, with the original implementation copied verbatim as the reference. Run them against the unchanged code first. They must pass, which shows the harness is wired correctly.
2. **Change the code.** Make the smallest change that implements the chosen approach. Keep the signature and contract. Add a short comment where the technique is not obvious.
3. **Verify.** Run the differential tests, then the full existing suite. Re-walk the behavior traps for this change and confirm each is covered by a test or ruled out by analysis.
4. **Benchmark.** Measure time and memory for the original and the new version at realistic `n`, at a larger `n`, and on worst-case inputs where relevant, following `DIFFERENTIAL-TESTING.md`. Record the numbers as measured. If the new version is not faster at realistic sizes, do not keep it unless the developer agrees for scaling reasons. If benchmarking cannot be run, say so and report the expected gain as estimated only.
5. **Handle unverified parts and behavior changes.** If any behavior cannot be verified, or the change alters behavior in any way, stop and ask the developer (rule 5). If they approve, add the `NEEDS-TESTING` or `BEHAVIOR-CHANGE` marker from `REPORTING.md`.
6. **Re-run after the final edit.** If anything changed after the last test run (review fixes, comments, formatting), run the differential tests and the full suite again. Results from an earlier version of the code do not count.
7. **Commit.** Unless the developer has said not to commit, make one commit per optimization, with a message that states the before and after complexity, the benchmark result, and the tests added. Do not mix bug fixes, formatting, or unrelated refactors into the commit.

If a differential test fails, the optimization is wrong. Fix the optimization, never the test. If the failure reveals that the original behavior is itself a bug, record it in the bug log and follow rule 4: if the best optimization removes the bug as a side effect, confirm that outputs differ only on the bug-triggering inputs and document it; otherwise keep matching the original.

## Phase 6: Close out

Update the report with what was applied, skipped, or rejected; final benchmark numbers; the bug log; and the full lists of `NEEDS-TESTING` and `BEHAVIOR-CHANGE` items. State plainly which items were verified by tests (with the evidence), which were accepted by the developer with unverified behavior, and which knowingly change behavior. Never describe any item as proven equivalent.
