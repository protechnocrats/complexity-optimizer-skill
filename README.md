# complexity-optimizer

A coding-agent skill that makes code faster by lowering time complexity and choosing the right data structures, without changing behavior. Every change is backed by differential tests that run the original and the optimized code on the same inputs and compare the results.

The skill is agent-neutral and language-agnostic. It works with any coding agent that supports skills (a folder with a `SKILL.md` and linked reference files), in any programming language.

## Quick start

```bash
# 1. Install into the project you want to optimize
cd path/to/your-project
npx skills add https://github.com/protechnocrats/complexity-optimizer-skill --skill complexity-optimizer

# 2. Start your coding agent in that project and ask:
#    "find time complexity problems in this project"
```

The agent returns a ranked report and changes nothing until you approve specific items.

## Installation

### Option 1: Skills CLI (recommended)

The [Skills CLI](https://skills.sh) installs the skill into the right place for your agent.

Per project (only active in this project; can be committed so your team gets it too):

```bash
npx skills add https://github.com/protechnocrats/complexity-optimizer-skill \
  --skill complexity-optimizer
```

For your user account (active in every project):

```bash
npx skills add https://github.com/protechnocrats/complexity-optimizer-skill \
  --skill complexity-optimizer \
  --global
```

Run `npx skills --help` to choose a specific agent or run non-interactively. Requires Node.js.

### Option 2: Manual install

Copy the `skills/complexity-optimizer/` folder (the folder that contains `SKILL.md`) into your agent's skills directory:

```bash
git clone https://github.com/protechnocrats/complexity-optimizer-skill.git
cp -r complexity-optimizer-skill/skills/complexity-optimizer <your-agent-skills-dir>/
```

For example, Claude Code reads skills from `.claude/skills/` in a project or `~/.claude/skills/` for your user. For other agents, check their documentation for the skills directory. Keep the folder intact: `SKILL.md` links to the other files by relative path.

### Option 3: Agents without skill support

If your agent does not support skills but reads a project instructions file (such as `AGENTS.md`), copy the folder into your repository and add a line to that file:

```markdown
For performance, time complexity, or data-structure work, follow skills/complexity-optimizer/SKILL.md and the files it links to.
```

### Verify the installation

Ask your agent: "Which skills do you have for optimizing time complexity?" It should name `complexity-optimizer`. Or ask it to "explain the complexity-optimizer rules" and check that it lists the mandatory rules.

### Update

Re-run the install command to fetch the latest version, or `git pull` your clone and copy the folder again.

## How it works

### Two modes

| Mode | Triggered by | What happens |
|---|---|---|
| **Report** (default) | "find performance problems", "review this for complexity", "what can be optimized?" | The agent surveys, analyzes, and returns a ranked report. **No code changes.** |
| **Apply** | "apply items 1 and 3", "optimize `findDuplicates` in `Util.kt`" | The agent changes only what you named, one optimization at a time, with tests and a benchmark for each. |

If the request is ambiguous, the agent asks before editing. Approving one item never approves the others.

### Workflow

1. **Setup:** detects languages and versions, finds your test and benchmark tooling, and runs your existing test suite. If tests already fail, it stops and tells you.
2. **Survey:** finds candidate hotspots and learns what each one does, who calls it, how often, and with what input sizes.
3. **Analyze:** states the theoretical lower bound, compares at least three approaches (including combinations such as hash map plus prefix sum, or sort plus two pointers), and checks each technique's assumptions against the code.
4. **Report:** ranks items by real-world impact.
5. **Apply** (only on approval): writes differential tests against the original first, makes the change, runs all tests, benchmarks before and after, and commits each optimization separately.
6. **Close out:** summarizes what was applied, what is marked as needing testing, bugs found, and pending dependency requests.

## Getting the best results

- **Start in report mode.** Read the report, then approve items by ID. You stay in control of every change.
- **Start from a clean working tree on a new branch.** Each optimization lands as its own commit, so any one can be reverted.
- **Share what you know about performance.** Profiler output, slow screens, slow endpoints, or "this list can hold 50,000 items" helps the agent focus on what matters. Without it, the agent estimates input sizes from the code and says so.
- **Narrow the scope for large projects.** Point it at a module, a directory, a file, or a single function instead of the whole repository.
- **Have a working test suite.** The agent runs it before and after every change. Projects with no tests still work, because the agent writes differential tests, but your own tests catch more.
- **Answer dependency requests deliberately.** When the best data structure is not in your language's standard library, the agent asks before adding a library and explains what it buys. You can decline; it then uses the best option without the dependency.
- **Follow up on `NEEDS-TESTING` markers.** If a change could not be fully proven equivalent and you approved it anyway, the agent marks it in the code and in the report with exactly what to verify. Search for `NEEDS-TESTING` before releasing.
- **Review behavior changes.** If an optimization would change behavior in any way, even for the better, the agent lists it under "Behavior changes for review" with the before and after behavior and waits for your decision. Approved ones are marked `BEHAVIOR-CHANGE` in the code.
- **Read the bug log.** Bugs the agent notices are documented in `BUGS-FOUND.md` and never fixed on purpose. Fix them separately. A bug removed as an unavoidable side effect of an optimization is marked as such there and listed under "Behavior changes for review".

## Example prompts

```
find time complexity problems in this project
```

```
review the data structures in app/src/main/java/com/example/feed for performance
```

```
why is FeedRepository.mergeItems slow? the list can have 20,000 items
```

```
apply items 1 and 3 from the optimization report
```

```
optimize findDuplicates in app/src/main/java/com/example/Util.kt
```

```
check this module for N+1 database queries
```

## What you get

- **`OPTIMIZATION-REPORT.md`:** for each item, the location, what the code does, who calls it, current complexity, theoretical lower bound, the candidates considered, the recommendation, memory impact, dependency needs, behavior risks, whether it can be proven with tests, and benchmark results once applied.
- **`BUGS-FOUND.md`:** bugs noticed during analysis, with inputs, impact, a suggested fix (not applied), and whether an optimization removed it as a side effect.
- **Differential tests** in your test sources, with the original implementation kept as a reference. You decide whether to keep them as regression tests.
- **One commit per applied optimization** with the before and after complexity and benchmark numbers.

For small results, the report is shown in the conversation instead of written to files. For larger ones, the agent asks where to write it (suggesting `optimization-report/`).

## Rules it enforces

1. **Time is invaluable. Space is cheap, but not infinite.** Memory may be spent to save time, but it must stay bounded and must not cost time through GC pressure, cache misses, or OOM crashes.
2. **Time first, then space.** Space is optimized only after time is optimal, and never at the expense of time.
3. **Understand first, then prove behavior is unchanged** with differential tests that compare return values, input mutation, exceptions, side effects, and ordering.
4. **Bugs are reported, never fixed on purpose.** The optimized code reproduces the original behavior. The only exception is a bug that the best optimization removes as an unavoidable side effect (for example, an iterative rewrite that no longer overflows the stack). That is applied, documented in the bug log, and marked for your review.
5. **Behavior changes are never silent.** Unprovable changes and any change that alters behavior (even for the better) are documented for developer review and applied only with explicit approval. Approved ones are marked `NEEDS-TESTING` or `BEHAVIOR-CHANGE` in code and in the report.
6. **Aim for the best possible complexity.** State the lower bound and compare at least three approaches, including combinations.
7. **Data structures must earn their place.** New dependencies need the developer's permission.
8. **Measure, do not only reason.** Benchmark before and after; leave cold code with tiny inputs alone.
9. **Label the case:** worst, average, or amortized.
10. **Look beyond CPU loops:** N+1 queries, network calls in loops, main-thread work.
11. **Keep the public contract:** signatures, return types, threading, and errors.
12. **Start green:** the existing test suite must pass before and after.
13. **Respect the project's idioms** and comment any non-obvious trick.
14. **Prefer the language's own data structures** over its host platform's (for example, Kotlin's `ArrayDeque` over `java.util.ArrayDeque`).

The full wording is in [`SKILL.md`](skills/complexity-optimizer/SKILL.md).

## Languages

The rules, workflow, algorithm arsenal, differential testing, and behavior traps apply to every language. Companion files add language-specific detail:

| Language | Companion file |
|---|---|
| Kotlin (JVM, Android, Multiplatform) | `languages/KOTLIN.md` |
| Java | `languages/JAVA.md` |
| Swift | `languages/SWIFT.md` |
| JavaScript and TypeScript | `languages/JAVASCRIPT-TYPESCRIPT.md` |
| C# | `languages/CSHARP.md` |
| Any other language | `languages/GENERIC.md`: the agent builds the same language profile before analyzing |

Each language file covers built-in data structures and their costs, which structures need a dependency, hidden costs, platform hot spots (Android, iOS, web, .NET), bit-manipulation APIs, language-specific behavior traps, and test and benchmark tooling.

## Files

| File | Purpose |
|---|---|
| `SKILL.md` | Mandatory rules, modes, language detection, workflow overview, anti-patterns |
| `WORKFLOW.md` | Setup, survey, analysis, report, apply, close-out |
| `ALGORITHM-ARSENAL.md` | Five triage questions, complexity reference, lower bounds, core techniques with their assumptions, production patterns, bit manipulation, combinations |
| `ADVANCED-TECHNIQUES.md` | Advanced graph, tree, range, DP, search, string, number-theory, and specialized-structure techniques |
| `DIFFERENTIAL-TESTING.md` | How to prove equivalence: reference copies, what to compare, inputs, benchmarks |
| `BEHAVIOR-TRAPS.md` | Rewrites that look equivalent but are not |
| `REPORTING.md` | Report format, behavior changes for review, bug log, `NEEDS-TESTING` and `BEHAVIOR-CHANGE` markers |
| `languages/*.md` | Per-language companions |

## Contributing

New language companion files are welcome. Use [`languages/GENERIC.md`](skills/complexity-optimizer/languages/GENERIC.md) as the checklist for what to cover, follow the structure of the existing files, add a row to the detection table in `SKILL.md`, and cite official documentation for every complexity and ordering claim.

## License

MIT. See [LICENSE](LICENSE).
