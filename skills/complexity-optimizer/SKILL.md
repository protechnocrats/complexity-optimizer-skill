---
name: complexity-optimizer
description: Lower time complexity and choose the right data structures in any programming language. Three modes. Report mode analyzes existing code and changes nothing. Apply mode optimizes existing code the developer names, verifying with differential tests that behavior does not change. Write mode writes new code with efficient algorithms and data structures from the start. Use for performance reviews, slow functions, algorithmic complexity questions, "optimize this", "make this faster", Big-O analysis, data-structure choice, and N+1 query problems. Also use when writing new code that processes large or growing collections, runs in hot paths (per request, per frame, per item), queries databases or services in loops, or needs a data-structure choice. Existing code changes only on an explicit request to apply or optimize it.
---

# Complexity Optimizer

Make code fast by lowering its time complexity, using the right data structures, and removing hidden costs: in existing code without changing its behavior, and in new code from the first version. The skill is language-agnostic: the rules and workflows apply to every language, and per-language companion files add detail where they exist. In existing code, never change behavior: every change is backed by differential tests that show the old and new code produce the same observable results, or it is clearly flagged for the developer.

## Mandatory rules

These rules apply to every project. They apply as written in report and apply mode. In write mode, some apply only to existing code: the table in [WRITING-NEW-CODE.md](WRITING-NEW-CODE.md) states exactly how each one applies. They override convenience, style preferences, and any instinct to "clean up while you are here."

1. **Time is invaluable. Space is cheap, but not infinite.** Extra memory is acceptable when it buys time. Memory must stay bounded and must not cost time through GC pressure, cache misses, or OOM crashes. Every cache, memo table, or index you add has an explicit size bound or a proof that it is bounded by input size the program already holds. Bounded is not enough when the project has a hard memory budget (embedded targets, kernels, per-request or per-process limits, mobile): an approach whose memory exceeds that budget is not a valid candidate, however fast it is.
2. **Time first, then space.** Look for space optimizations only after time complexity is optimal. Never reduce space by making time complexity worse, and never make time worse to save memory (for example, replacing an O(1) `HashMap` with an O(log n) array-backed map just to save memory).
3. **Understand before changing, and verify behavior is unchanged.** Before touching a function, establish what it computes, who calls it, how often, and with what input sizes. Write differential tests that run the original and the optimized version on the same inputs and compare every observable result. Behavior before and after must be identical. Passing tests are evidence, not proof: never claim equivalence is proven because differential tests pass. Report the inputs and properties covered, the tests and tools actually run, and any behavior left unverified. See [DIFFERENTIAL-TESTING.md](DIFFERENTIAL-TESTING.md) and [BEHAVIOR-TRAPS.md](BEHAVIOR-TRAPS.md).
4. **Bugs are always documented, and never fixed on purpose.** Record every bug in the bug log and tell the developer in the conversation. What happens to the code depends on whether it can be optimized:
   - **The buggy code cannot be optimized.** It is already optimal, or no optimization can be verified to keep behavior unchanged. Leave the code exactly as it is. Document the bug and tell the developer.
   - **The buggy code can be optimized.** Apply the optimization through the normal workflow (differential tests, benchmark, behavior-trap review) and tell the developer about the bug. Never add code, or choose or adjust an approach, in order to fix the bug. If the optimization keeps the bug, the bug stays. If the best optimization (rule 6) removes the bug as a side effect, keep the fix: confirm with differential tests that outputs differ only on inputs that trigger the bug, record it in the bug log as fixed as a side effect, and mark the code with `BEHAVIOR-CHANGE`.

   If it is unclear whether the old behavior is a bug or an intended contract (for example, an exception that callers may catch), do not treat it as a bug: any change to it is a behavior change under rule 5.
5. **Behavior changes are never silent.** Two cases need the developer's decision before anything is applied:
   - **Unverified equivalence:** tests cannot verify that behavior is unchanged (some observable behavior is not covered).
   - **Known behavior change:** the optimization alters any observable behavior other than a bug removed as a side effect under rule 4, including changes that look like improvements (failing faster, a different order, approximate instead of exact results, no longer throwing an exception callers may rely on).

   Document each one for developer review with the exact behavior before and after, and what is unverified. Apply it only after the developer explicitly approves that item. Then mark it in the code and in the report: `NEEDS-TESTING` for unverified equivalence, `BEHAVIOR-CHANGE` for a known change. See [REPORTING.md](REPORTING.md).
6. **Strive for the best possible complexity.** Do not stop at the first improvement. Whatever the starting complexity (factorial, exponential, polynomial of any degree, or a product of several size variables), establish the theoretical lower bound for the problem and keep looking for better approaches until you reach it or can explain why you stopped above it. A bound below the size of the input (O(log n), O(1)) is only possible when the work is amortized over repeated queries or the input is already structured, such as sorted or indexed. Enumerate candidate approaches with [ALGORITHM-ARSENAL.md](ALGORITHM-ARSENAL.md), and with [ADVANCED-TECHNIQUES.md](ADVANCED-TECHNIQUES.md) when the core techniques do not reach the lower bound or the problem is about graphs, trees, DP, search, strings, number theory, numerical computation, memory locality, parallelism, lock contention, streaming, hash table design, regular expressions, storage and indexing, spatial data, caching, or specialized structures. Confirm every technique's assumptions from the code.

   Compare approaches in proportion to the problem's difficulty. A problem is **straightforward** only when the strongest candidate reaches the stated lower bound, needs no new dependency (the standard library, or a structure the project already has), and has no behavior risks; then name that candidate and briefly explain why alternatives are unnecessary. Every other problem is **nontrivial**: evaluate at least three plausible approaches, including combinations where relevant. Never invent alternatives merely to meet a quota.

   Analysis never stops early: always identify and report the best achievable approach and the lower bound. Applying is evidence-driven: recommend applying a change only when measurements or a stated workload estimate show it pays off, and do not add a specialized structure solely for a better asymptotic bound. Stop applying once the bottleneck is resolved or the remaining cost is at the lower bound, and record what remains.
7. **Data structures must earn their place.** Introduce a data structure only when it reduces time complexity or a measured cost. If the structure is not in the language's standard library and would require a new dependency, explain why and ask the developer for permission before adding it. A small structure written inside the project is not a dependency, but it needs its own tests.
8. **Measure, do not only reason.** Big-O describes growth, not speed at a given size. Estimate realistic input sizes and call frequency. If `n` is provably tiny and the code is not hot, report the finding but do not change the code. "Provably tiny" means a bound visible in the code or data (a fixed enum, a constant-size table, a validated limit), not a guess about typical use; "not hot" means the code does not run per item, per request, per frame, or inside another loop. Benchmark time and memory before and after any applied change at realistic and larger sizes. Always label results as **measured** (benchmark or profile actually run) or **estimated** (complexity analysis or workload reasoning). If verification or benchmarking cannot be completed, state the limitation and do not present the optimization as a confirmed win.
9. **State which case you mean.** Label every complexity as worst-case, average-case (averaged over a stated input distribution), expected (averaged over the algorithm's own randomness or hashing), or amortized (averaged over a sequence of operations). Hash-based structures are O(1) expected but can degrade in the worst case; this matters when users or attackers control keys.
10. **Look beyond CPU loops.** Database queries in loops (N+1), network calls in loops, main-thread blocking, repeated parsing, and repeated I/O often dominate CPU complexity. Treat them as complexity problems.
11. **Keep the public contract.** Do not change a public function signature, return type, mutability of a returned collection, threading behavior, or error contract without asking.
12. **Start green.** Run the existing test suite before changing anything. If it fails, report the failures and stop until the developer decides how to proceed. Run it again after every change. If the project has no test suite, or the suite cannot run in this environment (missing toolchain or hardware, a kernel or firmware that must boot, a service that is not available), say so and continue: report mode is unaffected, and in apply mode the differential tests you write become the only automated check. Run them as a standalone test program if no test framework exists. If even they cannot run, every change is unverified (rule 5).
13. **Respect the project's idioms.** Use the language's standard library and the project's existing patterns. Readability counts: a clever trick (bit manipulation, sentinel values, manual indexing) needs a short comment explaining what it does and why.
14. **Prefer the project language's own data structures over the host platform's.** When a language runs on or interoperates with another platform's library, and the language provides an equivalent structure, use the language's own. In Kotlin, use `kotlin.collections` (`ArrayDeque`, `mutableListOf`, `hashMapOf`, `buildList`, `sortedMapOf`) instead of constructing `java.util` classes directly. Fall back to the platform structure only when the language has no equivalent (for example, `java.util.PriorityQueue` in Kotlin/JVM), and say so in the report. This applies to structures you introduce. Do not swap existing platform structures for preference alone; their behavior can differ (for example, `java.util.ArrayDeque` rejects `null` and Kotlin's `ArrayDeque` accepts it).

## Operating modes

- **Report mode.** Survey and analyze existing code, and produce a ranked report. Do not edit source files.
- **Apply mode.** Optimize existing code the developer named, one optimization at a time, each with its differential tests, benchmark, and its own commit when the project uses version control and the developer has not asked you not to commit. Approval to apply one item is not approval to apply others.
- **Write mode.** Write the new code the developer asked for, choosing efficient algorithms and data structures from the start. Follow [WRITING-NEW-CODE.md](WRITING-NEW-CODE.md). Existing code changes only as far as the request requires, never just for speed.

"Existing code" is code that existed before the current task started. "New code" is code written during the current task. The current task is the developer's current request, including follow-up messages about the same work.

### Choosing the mode

Pick the mode from the developer's request with this table. Use the first row that matches.

| The request | Mode |
|---|---|
| Invokes the skill with no task (for example, only the skill's name or slash command) | None yet: list the three modes with one sentence each and ask which one, and on what code |
| Names a mode ("report mode", "apply mode", "write mode") | That mode |
| Asks to apply items from a report, or to optimize, speed up, or fix the performance of specific existing code ("optimize `findDuplicates`", "make `loadFeed` faster") | Apply |
| Asks to rewrite or replace existing code while keeping what it does | Apply: the existing code is the reference for differential tests |
| Asks to find, review, analyze, or explain performance problems in existing code, or asks what can be optimized, without naming code to change | Report |
| Asks for new code: a project, feature, module, function, endpoint, script, or a replacement with new behavior the developer specifies | Write |
| Asks for new code and also for faster existing code ("add CSV export and speed up the orders page") | Write for the new code; report for the existing code, then ask before applying anything to it |
| Anything else, or two rows seem to fit | Ask one short question before editing anything |

State the mode in one line at the start of your first reply, with the reason, for example: "Write mode: this is a new feature, so I'll choose data structures for the expected sizes and list the performance decisions at the end." The developer can switch modes at any point; follow the switch.

"Specific existing code" means code identified by name, path, a selection, or the conversation so far. A request to "optimize this" or "make this faster" where nothing identifies the code is not apply mode: ask which code, or offer report mode.

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
| `*.c`, `*.h` (without C++ sources), C build files (`Makefile`, `CMakeLists.txt`, `meson.build`) | [languages/C.md](languages/C.md) |
| `*.rs`, `Cargo.toml` | [languages/RUST.md](languages/RUST.md) |
| Any other language | [languages/GENERIC.md](languages/GENERIC.md) |

In a project with several languages, load the file for each language you analyze.

Also record the language and runtime version (Kotlin/JVM vs Kotlin Multiplatform, Java version, Swift version, Node or browser target, .NET version). Standard-library availability depends on it.

## Workflow

Write mode follows [WRITING-NEW-CODE.md](WRITING-NEW-CODE.md). Report and apply modes follow [WORKFLOW.md](WORKFLOW.md):

1. **Setup** — detect languages, versions, test and benchmark tooling; run the existing test suite.
2. **Survey** — find candidate hotspots; for each, learn what it does, who calls it, how often, and with what sizes.
3. **Analyze** — state the problem, current complexity, lower bound, and candidate approaches from [ALGORITHM-ARSENAL.md](ALGORITHM-ARSENAL.md) (and [ADVANCED-TECHNIQUES.md](ADVANCED-TECHNIQUES.md) when needed) in proportion to difficulty (rule 6), with each one's assumptions checked; pick the best.
4. **Report** — write the ranked report defined in [REPORTING.md](REPORTING.md). Report mode ends here.
5. **Apply** — for each approved item: differential tests on the original first, then the change, then tests, behavior-trap review, and benchmark.
6. **Close out** — final report with applied changes, benchmark results, bugs found, and anything marked as needing testing.

## Anti-patterns

1. Stopping at the first improvement without checking whether a better bound exists.
2. Claiming a complexity without naming the case (worst, average, expected, amortized) or the variable it depends on.
3. "Optimizing" code where `n` is tiny and the call is cold, then presenting it as a win.
4. Replacing a structure and silently changing iteration order, sort stability, duplicates, or nullability.
5. Fixing a bug on purpose, or picking an approach because it fixes a bug. Only bugs removed as a side effect of the best optimization are allowed (rule 4), and every bug is documented and reported.
6. Memoizing or caching a function that is not pure, or adding a cache with no bound.
7. Adding a dependency without asking.
8. Making time complexity worse to save memory (rule 2).
9. Differential tests that compare only return values while ignoring input mutation, exceptions, side effects, and order.
10. Rewriting idiomatic code into an unreadable form for a constant-factor gain that was never measured.
11. Using a technique outside its assumptions (a sliding window over values that can be negative, Dijkstra with negative weights, binary search on a predicate that is not monotonic).
12. Applying a behavior-changing optimization without documenting it and getting the developer's explicit approval, even when the change looks like an improvement.
13. Claiming behavior is proven equivalent because differential tests pass, or presenting an estimated speedup as a measured one.
14. Padding the candidate list with implausible alternatives, or labeling a problem straightforward to skip the comparison.
15. Analyzing a function in isolation and missing that its callers run it inside loops, or looking only for quadratic code and missing exponential, factorial, and cubic costs.

Write mode has its own anti-patterns in [WRITING-NEW-CODE.md](WRITING-NEW-CODE.md).
