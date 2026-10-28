# Reporting

## Where reports go

For a small result (one or two items), present the report in the conversation. Otherwise ask the developer where to write it, suggesting `optimization-report/` at the project root, and ask whether it should be ignored by version control. The report has two files:

- `OPTIMIZATION-REPORT.md` — the ranked items, applied changes, benchmarks, and needs-testing list.
- `BUGS-FOUND.md` — every bug noticed, none of which were fixed.

## Optimization item format

Rank items by expected real-world impact. Use this format for each:

```markdown
### <ID>. <Short title>

- **Location:** `path/to/File.kt:123` — `functionName`
- **What it does:** One or two sentences in plain language.
- **Callers and usage:** Who calls it, how often, on which thread, typical and maximum input sizes (state the assumption and its source).
- **Current complexity:** Time O(...) [worst | average | amortized], space O(...), in terms of named variables.
- **Lower bound:** O(...) because ...
- **Candidates considered:**
  1. <Approach> — time O(...), space O(...), notes.
  2. <Approach> — time O(...), space O(...), notes.
  3. <Approach or combination> — time O(...), space O(...), notes.
- **Recommended:** <Approach> — time O(...), space O(...). Why it wins. If above the lower bound, why.
- **Memory bound:** What new memory is used and why it is bounded.
- **Dependency needed:** None, or the library name, version, license, and why (requires developer permission).
- **Behavior risks:** Traps from BEHAVIOR-TRAPS.md that apply, and how each will be covered.
- **Provable with tests:** Yes, or which behavior cannot be proven and why.
- **Status:** Proposed | Applied (proven) | Applied (NEEDS-TESTING, developer approved) | Skipped (reason) | Not worth changing (n is small and the path is cold).
- **Benchmark:** Before and after at realistic n and at larger n, once applied.
```

Also list candidates that were considered and dropped, with the reason, so the developer sees what was checked.

## Bug log format

Rule 4: document bugs, never fix them as part of an optimization.

```markdown
### BUG-<N>. <Short title>

- **Location:** `path/to/File.kt:123`
- **What happens:** The incorrect behavior, with a concrete input and output.
- **Expected:** What appears to be intended, and why you think so.
- **Impact:** Who or what is affected.
- **Preserved by optimization:** Yes — the optimized code reproduces this behavior exactly. (Or: not touched by any optimization.)
- **Suggested fix:** Optional, described only. Not applied.
```

Tell the developer about each bug in the conversation as well as in the file.

## NEEDS-TESTING marker

Rule 5: when the developer approves a change whose equivalence tests cannot fully prove, mark it in the code directly above the changed code, using the language's comment syntax:

```
// NEEDS-TESTING (complexity-optimizer): <what changed>.
// Unverified: <the exact behavior tests could not prove>.
// Approved by the developer on <YYYY-MM-DD>. See OPTIMIZATION-REPORT.md item <ID>.
```

Also list every marked change in a "Needs testing" section at the top of `OPTIMIZATION-REPORT.md`, with location, what is unverified, and a suggested way to verify it (manual test steps, an integration test, a staging check). Never remove a marker unless the developer confirms the behavior has been verified.

## Final summary

End every run with a short summary in the conversation:

- Items applied and proven equivalent.
- Items applied with developer approval but marked `NEEDS-TESTING`.
- Items proposed but not applied.
- Bugs found (count and IDs).
- Dependency requests pending.
- Test suite status before and after.
