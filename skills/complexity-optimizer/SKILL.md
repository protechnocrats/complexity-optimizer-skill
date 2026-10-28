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
4. **Report bugs, do not fix them.** If you find a bug along the way, document it and tell the developer. Do not fix it as part of an optimization. The optimized code reproduces the original behavior exactly, bug included. A bug fix is a behavior change and belongs in a separate, developer-approved change.
5. **Unproven equivalence needs a developer decision.** If tests cannot prove that behavior is unchanged, stop and ask the developer. If they accept the change, mark it clearly in the code and in the report as needing testing, stating exactly what is unverified. See [REPORTING.md](REPORTING.md).
6. **Strive for the best possible complexity.** Do not stop at the first improvement. From O(n²), check whether O(n log n), O(n), O(log n), or O(1) is achievable. Establish the theoretical lower bound for the problem and either reach it or explain why you stopped above it. Enumerate candidate approaches, including combinations of techniques, with [ALGORITHM-ARSENAL.md](ALGORITHM-ARSENAL.md).
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
3. **Analyze** — state the problem, current complexity, lower bound, and at least three candidate approaches from [ALGORITHM-ARSENAL.md](ALGORITHM-ARSENAL.md); pick the best.
4. **Report** — write the ranked report defined in [REPORTING.md](REPORTING.md). Report mode ends here.
5. **Apply** — for each approved item: differential tests on the original first, then the change, then tests, behavior-trap review, and benchmark.
6. **Close out** — final report with applied changes, benchmark results, bugs found, and anything marked as needing testing.

## Anti-patterns

1. Stopping at the first improvement without checking whether a better bound exists.
2. Claiming a complexity without naming the case (worst, average, amortized) or the variable it depends on.
3. "Optimizing" code where `n` is tiny and the call is cold, then presenting it as a win.
4. Replacing a structure and silently changing iteration order, sort stability, duplicates, or nullability.
5. Fixing a bug inside an optimization change.
6. Memoizing or caching a function that is not pure, or adding a cache with no bound.
7. Adding a dependency without asking.
8. Trading time for memory.
9. Differential tests that compare only return values while ignoring input mutation, exceptions, side effects, and order.
10. Rewriting idiomatic code into an unreadable form for a constant-factor gain that was never measured.
