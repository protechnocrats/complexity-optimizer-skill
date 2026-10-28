# Reporting

## Where reports go

For a small result (one or two items), present the report in the conversation. Otherwise ask the developer where to write it, suggesting `optimization-report/` at the project root, and ask whether it should be ignored by version control. The report has two files:

- `OPTIMIZATION-REPORT.md` — the ranked items, applied changes, benchmarks, and needs-testing list.
- `BUGS-FOUND.md` — every bug noticed. None are fixed on purpose; any removed as a side effect of an optimization are marked as such.

## Optimization item format

Rank items by expected real-world impact. Use this format for each:

```markdown
### <ID>. <Short title>

- **Location:** `path/to/File.kt:123` — `functionName`
- **What it does:** One or two sentences in plain language.
- **Callers and usage:** Who calls it, how often, on which thread, typical and maximum input sizes (state the assumption and its source).
- **Current complexity:** Time O(...) [worst | average | amortized], space O(...), in terms of named variables. Include the cost of the functions it calls and, when callers invoke it in a loop, the total cost along the call chain.
- **Lower bound:** O(...) because ... Basis: proven (for example, must read every input) | conditional (holds only under a stated assumption, such as comparison-based sorting) | conjectured (no faster algorithm is known, such as 3SUM) | workload-dependent (follows from the measured or stated call pattern).
- **Difficulty:** Straightforward (strongest candidate reaches the lower bound, needs no new dependency, and has no behavior risks) | Nontrivial.
- **Candidates considered:** Straightforward: the strongest candidate and why alternatives are unnecessary. Nontrivial: at least three plausible approaches:
  1. <Approach> — time O(...) (preprocessing and per-query separately), space O(...), notes.
  2. <Approach> — time O(...), space O(...), notes.
  3. <Approach or combination> — time O(...), space O(...), notes.
- **Recommended:** <Approach> — time O(...), space O(...). Why it wins. If above the lower bound, why.
- **Kind of win:** One or more of: Asymptotic (the growth rate changes, for example O(n²) → O(n log n)) | Constant-factor (same bound; fewer allocations, cache misses, branch misses, or instructions) | Work avoided (caching, batching, early exit, incremental updates). Never present a constant-factor or work-avoided win as a complexity reduction.
- **Memory bound:** What new memory is used and why it is bounded.
- **Dependency needed:** None, or the library name, version, license, and why (requires developer permission).
- **Behavior risks:** Traps from BEHAVIOR-TRAPS.md that apply, and how each will be covered.
- **Bottleneck evidence:** Profile, trace, query plan, benchmark, developer report, or static estimate only.
- **Assumptions:** Each assumption the technique needs and the evidence from the code that it holds.
- **Behavior changes:** None, or the exact behavior before and after (rule 5).
- **Verification:** Inputs and properties covered (edge cases, number of generated cases, seeds, sizes), tests and tools actually run with results, and behavior left unverified. Never "proven".
- **Status:** Proposed | Applied (verified by tests) | Applied (NEEDS-TESTING, developer approved) | Applied (BEHAVIOR-CHANGE, developer approved) | Awaiting developer review | Skipped (reason) | Not worth changing (n is small and the path is cold).
- **Performance:** Measured: time and memory before and after at realistic n, larger n, and worst-case inputs where relevant, with environment, run count, median, and variance, as absolute values and percentage change. Estimated: the theoretical gain, labeled as estimated. If measurement could not be completed, say why; the item is not a confirmed win.
```

Also list candidates that were considered and dropped, with the reason, so the developer sees what was checked.

## Bug log format

Rule 4: document every bug and tell the developer. Never fix one on purpose. Bugs in code that is not optimized stay as they are; bugs in optimized code stay unless the optimization removes them as a side effect.

```markdown
### BUG-<N>. <Short title>

- **Location:** `path/to/File.kt:123`
- **What happens:** The incorrect behavior, with a concrete input and output.
- **Expected:** What appears to be intended, and why you think so.
- **Impact:** Who or what is affected.
- **Status:** Left as is (code not optimized: already optimal, or equivalence could not be guaranteed) | Preserved in optimized code (item <ID>) | Fixed as a side effect of item <ID> (marked `BEHAVIOR-CHANGE`).
- **Suggested fix:** Optional, described only. Not applied (unless fixed as a side effect).
```

Tell the developer about each bug in the conversation as well as in the file.

## Behavior changes for review

Rule 5: every optimization that would change observable behavior, including changes that look like improvements, is listed at the top of `OPTIMIZATION-REPORT.md` under "Behavior changes for review" before anything is applied:

```markdown
### <ID>. <Short title>

- **Location:** `path/to/File.kt:123`
- **Behavior before:** What callers observe today, with a concrete input and output.
- **Behavior after:** What callers would observe, with the same input.
- **Who could notice:** Callers, users, stored data, or integrations affected.
- **Why it is needed:** What the optimization gains, and the best equivalent alternative if one exists.
- **Decision:** Awaiting developer review | Approved on <YYYY-MM-DD> | Declined.
```

If the developer approves, mark the code directly above the change:

```
// BEHAVIOR-CHANGE (complexity-optimizer): <what changed>.
// Before: <old behavior>. After: <new behavior>.
// Approved by the developer on <YYYY-MM-DD>. See OPTIMIZATION-REPORT.md item <ID>.
```

If the developer declines, keep the original behavior and use the best equivalent approach instead.

## NEEDS-TESTING marker

Rule 5: when the developer approves a change whose equivalence tests cannot fully verify, mark it in the code directly above the changed code, using the language's comment syntax:

```
// NEEDS-TESTING (complexity-optimizer): <what changed>.
// Unverified: <the exact behavior tests could not verify>.
// Approved by the developer on <YYYY-MM-DD>. See OPTIMIZATION-REPORT.md item <ID>.
```

Also list every marked change in a "Needs testing" section at the top of `OPTIMIZATION-REPORT.md`, with location, what is unverified, and a suggested way to verify it (manual test steps, an integration test, a staging check). Never remove a marker unless the developer confirms the behavior has been verified.

## Final summary

End every run with a short summary in the conversation:

- Items applied and verified by tests, with a one-line summary of the evidence for each.
- Items applied with developer approval but marked `NEEDS-TESTING`.
- Items applied with developer approval that knowingly change behavior (`BEHAVIOR-CHANGE`).
- Behavior changes still awaiting developer review.
- Items proposed but not applied.
- Bugs found (count and IDs).
- Dependency requests pending.
- Test suite status before and after, from runs on the final code.
- Which performance numbers are measured and which are estimated, and any verification that could not be completed.
