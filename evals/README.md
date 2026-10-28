# Evaluating the skill

These evals check whether an agent using the skill makes the right call on code where the right answer is already known. Each fixture is a small project with planted cases. Each case targets one rule: a straightforward fix, a technique whose assumptions do not hold, an ordering trap, a planted bug, a security trap, code that is not worth changing, and so on.

`npx skills add` installs only `skills/complexity-optimizer/`, so nothing in `evals/` reaches people who install the skill.

## Layout

```
evals/
├── fixtures/
│   ├── kotlin-shop/   ← 14 cases (Kotlin/JVM, Gradle, JUnit 4)
│   ├── ts-shop/       ← 12 cases (TypeScript, Node's built-in test runner, no dependencies)
│   ├── swift-shop/    ← 10 cases (Swift Package Manager, XCTest); not yet verified on a toolchain
│   ├── c-shop/        ← 10 cases (C11, plain asserts, optional sanitizers)
│   └── rust-shop/     ← 12 cases (Cargo, no dependencies)
├── answers/           ← answer keys; never let the agent see these
├── SCORECARD.md       ← copy per session and fill in
└── new-run.sh         ← creates a fresh run directory outside the repo
```

## Requirements

- **kotlin-shop:** a full JDK 17 or newer (with `javac`) and network access for the first Gradle build. If your default Java has no compiler, point `JAVA_HOME` at a full JDK, for example the one bundled with Android Studio (`<android-studio>/jbr`).
- **ts-shop:** Node.js 23.6 or newer, which runs TypeScript files directly.
- **swift-shop:** Swift 5.9 or newer (Xcode on macOS, or a Swift toolchain on Linux). This fixture has not been run yet; see the status note in `answers/swift-shop.md`.
- **c-shop:** a C11 compiler (`cc`, `gcc`, or `clang`; set `CC` to choose). `./test.sh sanitize` builds with AddressSanitizer and UBSan where supported.
- **rust-shop:** Rust 1.80 or newer with Cargo.

Check that the fixture is green before you start:

```bash
cd evals/fixtures/kotlin-shop && ./gradlew test
cd evals/fixtures/ts-shop && npm test
cd evals/fixtures/swift-shop && swift test
cd evals/fixtures/c-shop && ./test.sh && ./test.sh sanitize
cd evals/fixtures/rust-shop && cargo test
```

## Running one evaluation

1. **Create a run directory** outside the repository so the agent cannot read the answer keys:

   ```bash
   # With the skill (copies it into the run directory, here for Claude Code):
   evals/new-run.sh kotlin-shop --skill .claude/skills

   # Baseline without the skill:
   evals/new-run.sh kotlin-shop
   ```

   The script prints the new directory. It contains the fixture as a fresh Git repository with one commit. For other agents, pass that agent's project skills directory to `--skill`, or install the skill there with the agent's own method.

   For a baseline run, make sure the skill is not installed globally for your agent.

2. **Start the agent in the run directory** and send the report-mode prompt:

   ```
   Find time complexity and data-structure problems in this project and write a report.
   ```

   Score the report against the answer key. Check that the agent changed no files (`git status`).

3. **Send the apply-mode prompt:**

   ```
   Apply all the optimizations you recommend.
   ```

   To keep runs comparable, **decline every approval request and every dependency request** during the eval. This tests that the agent asks, and that it falls back to the best option that needs no approval.

4. **Check the result:**

   ```bash
   git log --oneline                 # one commit per optimization
   git diff HEAD~N -- src            # what changed
   ./gradlew test   # or npm test, swift test, ./test.sh, cargo test: still green on the final code
   ```

5. **Score** the run in a copy of `SCORECARD.md` using `answers/<fixture>.md`.

## Getting meaningful results

- **Run each fixture three times.** Agents vary between runs; one run proves little.
- **Compare with and without the skill.** Cases that pass either way show where the skill adds nothing. Cases that fail even with the skill show where its wording needs work. Record the difference in the "Skill lift" table of `SCORECARD.md`.
- **Compare agents.** The skill is meant to be agent-neutral. A case that passes in one agent but fails in another usually points to an ambiguous rule.
- **Fix the skill, not the fixture.** When a case fails, change the skill's wording, then rerun. Change a fixture only if the case itself is wrong.

## Adding a case

1. Add the code to a fixture, written as ordinary project code. Do not hint at the answer in names or comments.
2. Keep the fixture's existing tests green. Planted bugs must not be caught by the existing tests.
3. Verify that the trap actually triggers (for example, that the recursion really overflows, or that the alternative really changes output).
   If the trap depends on the platform or library version (for example, `qsort` stability or stack depth), record where you verified it in the answer key.
4. Add the case to the answer key with the expected outcome, pass criteria, and failure signals.
