---
name: complexity-optimizer
description: Optimize time complexity and choose appropriate data structures in a codebase written in any programming language, while proving with differential tests that behavior does not change. Use for performance reviews, slow functions, algorithmic complexity questions, "optimize this", "make this faster", Big-O analysis, data-structure choice, or N+1 query problems. Report first; change code only for an explicit request to apply or optimize specific code.
---

# Complexity Optimizer

Make code faster by lowering its time complexity, using the right data structures, and removing hidden costs. The skill is language-agnostic: the rules and workflow apply to every language, and per-language companion files add detail where they exist. Never change behavior. Every change is backed by differential tests that show the old and new code produce the same observable results, or it is clearly flagged for the developer.

## Mandatory rules

These rules apply to every project and every mode. They override convenience, style preferences, and any instinct to "clean up while you are here."

1. **Time is invaluable. Space is cheap, but not infinite.** Extra memory is acceptable when it buys time. Memory must stay bounded and must not cost time through GC pressure, cache misses, or OOM crashes. Every cache, memo table, or index you add has an explicit size bound or a proof that it is bounded by input size the program already holds.
2. **Time first, then space.** Look for space optimizations only after time complexity is optimal. Never reduce space by making time complexity worse, and never make time worse to save memory (for example, replacing an O(1) `HashMap` with an O(log n) array-backed map just to save memory).
3. **Understand before changing, and prove behavior is unchanged.** Before touching a function, establish what it computes, who calls it, how often, and with what input sizes. Write differential tests that run the original and the optimized version on the same inputs and compare every observable result. Behavior before and after must be identical. See [DIFFERENTIAL-TESTING.md](DIFFERENTIAL-TESTING.md) and [BEHAVIOR-TRAPS.md](BEHAVIOR-TRAPS.md).
4. **Report bugs, never fix them on purpose.** Document every bug you find and tell the developer. Never write code to fix a bug, and never choose or adjust an approach in order to fix one. Fixing bugs is the developer's decision and outside this skill. By default, the optimized code reproduces the original behavior exactly, bug included.

   **One exception: a fix that is an unavoidable side effect.** When the best optimization (rule 6) removes a bug as a side effect, apply it. For example, an iterative rewrite chosen for speed may no longer overflow the stack. Conditions:
   - The approach was chosen for performance, and no extra code was added to fix the bug.
   - The old behavior is clearly a bug, not an intended contract. If it is unclear whether callers rely on it (for example, a thrown exception they catch), treat it as a behavior change that needs approval (rule 5).
   - Differential tests show that outputs differ only on inputs that trigger the bug, and that the new results on those inputs are correct.
   - It is documented: the bug log records it as fixed as a side effect, the code carries the `BEHAVIOR-CHANGE` marker, and the report lists it under "Behavior changes for review" so the developer can review it.
5. **Behavior changes are never silent.** Two cases need the developer's decision before anything is applied:
   - **Unproven equivalence:** tests cannot prove that behavior is unchanged.
   - **Known behavior change:** the optimization alters any observable behavior other than an unavoidable bug fix under rule 4, including changes that look like improvements (failing faster, a different order, approximate instead of exact results, no longer throwing an exception callers may rely on).

   Document each one for developer review with the exact behavior before and after, and what is unverified. Apply it only after the developer explicitly approves that item. Then mark it in the code and in the report: `NEEDS-TESTING` for unproven equivalence, `BEHAVIOR-CHANGE` for a known change. See [REPORTING.md](REPORTING.md).
6. **Strive for the best possible complexity.** Do not stop at the first improvement. From O(n²), check whether O(n log n), O(n), O(log n), or O(1) is achievable. Establish the theoretical lower bound for the problem and either reach it or explain why you stopped above it. Enumerate candidate approaches, including combinations of techniques, with [ALGORITHM-ARSENAL.md](ALGORITHM-ARSENAL.md), and with [ADVANCED-TECHNIQUES.md](ADVANCED-TECHNIQUES.md) when the core techniques do not reach the lower bound or the problem is about graphs, trees, DP, search, strings, number theory, or specialized structures. Confirm every technique's assumptions from the code.
7. **Data structures must earn their place.** Introduce a data structure only when it reduces time complexity or a measured cost. If the structure is not in the language's standard library and would require a new dependency, explain why and ask the developer for permission before adding it. A small structure written inside the project is not a dependency, but it needs its own tests.
8. **Measure, do not only reason.** Big-O describes growth, not speed at a given size. Estimate realistic input sizes and call frequency. If `n` is provably tiny and the code is not hot, report the finding but do not change the code. Benchmark before and after any applied change at realistic and larger sizes.
9. **State which case you mean.** Label every complexity as worst-case, average-case, or amortized. Hash-based structures are O(1) on average but can degrade in the worst case; this matters when users or attackers control keys.
10. **Look beyond CPU loops.** Database queries in loops (N+1), network calls in loops, main-thread blocking, repeated parsing, and repeated I/O often dominate CPU complexity. Treat them as complexity problems.
11. **Keep the public contract.** Do not change a public function signature, return type, mutability of a returned collection, threading behavior, or error contract without asking.
12. **Start green.** Run the existing test suite before changing anything. If it fails, report the failures and stop until the developer decides how to proceed. Run it again after every change.
13. **Respect the project's idioms.** Use the language's standard library and the project's existing patterns. Readability counts: a clever trick (bit manipulation, sentinel values, manual indexing) needs a short comment explaining what it does and why.
14. **Prefer the project language's own data structures over the host platform's.** When a language runs on or interoperates with another platform's library, and the language provides an equivalent structure, use the language's own. In Kotlin, use `kotlin.collections` (`ArrayDeque`, `mutableListOf`, `hashMapOf`, `buildList`, `sortedMapOf`) instead of constructing `java.util` classes directly. Fall back to the platform structure only when the language has no equivalent (for example, `java.util.PriorityQueue` in Kotlin/JVM), and say so in the report. This applies to structures you introduce. Do not swap existing platform structures for preference alone; their behavior can differ (for example, `java.util.ArrayDeque` rejects `null` and Kotlin's `ArrayDeque` accepts it).

## Operating modes

- **Report mode (default).** For requests like "find performance problems," "review this for complexity," or "what can be optimized": survey, analyze, and produce a ranked report. Do not edit source files.
- **Apply mode.** Only when the developer explicitly asks to apply changes, or asks to optimize a specific function, file, or report item. Apply one optimization at a time, each with its differential tests, benchmark, and its own commit when the project uses version control.

If it is unclear which mode the developer wants, ask one short question before editing anything. Approval to apply one item is not approval to apply others.

## Platform terminology

This skill is agent-neutral. "The agent" is whatever coding agent loads it. Where the workflow says "search callers," "run tests," or "ask the developer," use the platform's equivalent tools. If the platform supports sub-agents, independent analysis of separate candidates may run in parallel, but one agent owns all source edits.

## Language detection

This skill works for any programming language. Before analysis, identify the project's languages from build and source files. If a companion file exists for a language, load it. For every other language, load [languages/GENERIC.md](languages/GENERIC.md), which has the agent build the same language profile before analyzing; all rules and the full workflow still apply. A missing companion file is never a reason to skip or weaken the workflow.

Companion files available now:

| Signals | Load |
|---|---|
| `*.kt`, `*.kts`, Kotlin Gradle plugin | [languages/KOTLIN.md](languages/KOTLIN.md) (and [languages/JAVA.md](languages/JAVA.md) only for JVM structures Kotlin lacks; rule 14) |
| `*.java`, `pom.xml`, `build.gradle` without Kotlin | [languages/JAVA.md](languages/JAVA.md) |
| `*.swift`, `Package.swift`, `*.xcodeproj` | [languages/SWIFT.md](languages/SWIFT.md) |
| `*.js`, `*.mjs`, `*.ts`, `*.tsx`, `package.json`, `tsconfig.json` | [languages/JAVASCRIPT-TYPESCRIPT.md](languages/JAVASCRIPT-TYPESCRIPT.md) |
| `*.cs`, `*.csproj`, `*.sln` | [languages/CSHARP.md](languages/CSHARP.md) |
| Any other language | [languages/GENERIC.md](languages/GENERIC.md) |

In a project with several languages, load the file for each language you analyze.

Also record the language and runtime version (Kotlin/JVM vs Kotlin Multiplatform, Java version, Swift version, Node or browser target, .NET version). Standard-library availability depends on it.

## Workflow

Follow [WORKFLOW.md](WORKFLOW.md):

1. **Setup** — detect languages, versions, test and benchmark tooling; run the existing test suite.
2. **Survey** — find candidate hotspots; for each, learn what it does, who calls it, how often, and with what sizes.
3. **Analyze** — state the problem, current complexity, lower bound, and at least three candidate approaches from [ALGORITHM-ARSENAL.md](ALGORITHM-ARSENAL.md) (and [ADVANCED-TECHNIQUES.md](ADVANCED-TECHNIQUES.md) when needed), with each one's assumptions checked; pick the best.
4. **Report** — write the ranked report defined in [REPORTING.md](REPORTING.md). Report mode ends here.
5. **Apply** — for each approved item: differential tests on the original first, then the change, then tests, behavior-trap review, and benchmark.
6. **Close out** — final report with applied changes, benchmark results, bugs found, and anything marked as needing testing.

## Anti-patterns

1. Stopping at the first improvement without checking whether a better bound exists.
2. Claiming a complexity without naming the case (worst, average, amortized) or the variable it depends on.
3. "Optimizing" code where `n` is tiny and the call is cold, then presenting it as a win.
4. Replacing a structure and silently changing iteration order, sort stability, duplicates, or nullability.
5. Fixing a bug on purpose inside an optimization change, or picking an approach because it fixes a bug. Only unavoidable side-effect fixes are allowed (rule 4), and they must be documented.
6. Memoizing or caching a function that is not pure, or adding a cache with no bound.
7. Adding a dependency without asking.
8. Trading time for memory.
9. Differential tests that compare only return values while ignoring input mutation, exceptions, side effects, and order.
10. Rewriting idiomatic code into an unreadable form for a constant-factor gain that was never measured.
11. Using a technique outside its assumptions (a sliding window over values that can be negative, Dijkstra with negative weights, binary search on a predicate that is not monotonic).
12. Applying a behavior-changing optimization without documenting it and getting the developer's explicit approval, even when the change looks like an improvement.
