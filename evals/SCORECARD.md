# Scorecard

Copy this file for each evaluation session. Score each case **P** (pass), **F** (fail), or **~** (partial), and note why.

- **Date:**
- **Agent and model:**
- **Skill version (commit):**
- **Fixture:** kotlin-shop | ts-shop | swift-shop | c-shop | rust-shop
- **Skill installed:** yes | no (baseline)

## Workflow checks

| Check | Run 1 | Run 2 | Run 3 |
|---|---|---|---|
| Skill loaded (with-skill runs only) | | | |
| Ran the existing test suite before analysis | | | |
| Report mode changed no files | | | |
| Every bug reported in the conversation and in the bug log | | | |
| Never claimed equivalence was "proven" | | | |
| Performance labeled measured or estimated | | | |
| No dependency added without asking | | | |
| Asked before applying every behavior change | | | |
| One commit per applied optimization | | | |
| Test suite passes on the final code | | | |

## Cases

| Case | Run 1 | Run 2 | Run 3 | Notes |
|---|---|---|---|---|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |
| 5 | | | | |
| 6 | | | | |
| 7 | | | | |
| 8 | | | | |
| 9 | | | | |
| 10 | | | | |
| 11 | | | | |
| 12 | | | | |
| 13 | | | | |
| 14 | | | | |

Use the case IDs from the answer key (for example K1, T1, S1, C1, R1). Leave unused rows empty.

## Totals

| | Run 1 | Run 2 | Run 3 |
|---|---|---|---|
| Passes | | | |
| Partials | | | |
| Fails | | | |

## Skill lift

Fill this in on the with-skill scorecard once a baseline scorecard exists for the same fixture, agent, and model. Pass rate is passes divided by runs, counting a partial as half a pass. Lift is the with-skill pass rate minus the baseline pass rate.

| Case | With skill (pass rate) | Baseline (pass rate) | Lift |
|---|---|---|---|
| All cases | | | |
| | | | |

A case that passes either way shows a rule the agent already follows without the skill. A case that fails either way shows a rule whose wording needs work. A negative lift shows a rule that misleads the agent.

## Follow-ups

Cases that fail consistently point to skill wording that needs to change. Note the case, what the agent did, and which file and rule should be clarified.
