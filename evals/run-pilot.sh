#!/usr/bin/env bash
# Runs ts-shop (report, apply, decline) and the TW1 write-mode case headlessly
# with Claude Code, with and without the skill, and saves every transcript.
# Start it detached so it survives closing the terminal:
#   nohup setsid evals/run-pilot.sh > /dev/null 2>&1 &
set -uo pipefail

usage() {
  cat <<'EOF'
Usage: evals/run-pilot.sh [--runs N] [--parallel P] [--budget USD] [--out DIR]

  --runs N       Runs per case and condition (default 1)
  --parallel P   Sessions at a time (default 2)
  --budget USD   Spending cap per turn, passed to --max-budget-usd (default 5)
  --out DIR      Output directory (default ~/complexity-optimizer-evals/pilot-<timestamp>)

Progress: <out>/progress.log. Per session: <out>/<session>/ (the run
directory) and <out>/logs/<session>.* (transcripts, cost, git and test state).
EOF
}

runs=1; parallel=2; budget=5; out=""
while [ $# -gt 0 ]; do
  case "$1" in
    --runs) runs="$2"; shift 2 ;;
    --parallel) parallel="$2"; shift 2 ;;
    --budget) budget="$2"; shift 2 ;;
    --out) out="$2"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown option: $1" >&2; usage; exit 1 ;;
  esac
done

repo="$(cd "$(dirname "$0")/.." && pwd)"
out="${out:-$HOME/complexity-optimizer-evals/pilot-$(date +%Y%m%d-%H%M%S)}"
mkdir -p "$out/logs"
progress="$out/progress.log"
note() { echo "$(date '+%F %T') $*" >> "$progress"; }

# One session: <case: ts|tw1> <skill|baseline> <run number>
session() {
  local case_id="$1" cond="$2" n="$3"
  local name="$case_id-$cond-$n" dest="$out/$1-$2-$3" log="$out/logs/$1-$2-$3"
  local skill_args=() id
  [ "$cond" = skill ] && skill_args=(--skill .claude/skills)
  "$repo/evals/new-run.sh" ts-shop "${skill_args[@]}" --dest "$dest" > /dev/null || { note "$name: setup failed"; return; }
  id="$(python3 -c 'import uuid; print(uuid.uuid4())')"
  note "$name: started (session $id)"

  local allowed=(Read Edit Write Glob Grep Skill TodoWrite "Bash(npm test)" "Bash(npm test:*)" "Bash(node:*)" "Bash(git:*)")
  local turn=0
  ask() {  # ask <label> <prompt>
    local label="$1" prompt="$2" resume=(--session-id "$id")
    [ "$turn" -gt 0 ] && resume=(--resume "$id")
    turn=$((turn + 1))
    (cd "$dest" && timeout 2700 claude -p "$prompt" "${resume[@]}" \
       --allowedTools "${allowed[@]}" --max-budget-usd "$budget" \
       --output-format stream-json --verbose > "$log.$turn-$label.jsonl" 2> "$log.$turn-$label.err")
    note "$name: turn $turn ($label) exit=$?"
  }
  local decline="Decline every approval request and every dependency request. Continue with anything that needs no approval, then finish."

  if [ "$case_id" = ts ]; then
    ask report "Find time complexity and data-structure problems in this project and write a report."
    (cd "$dest" && git status --porcelain) > "$log.after-report.status"
    ask apply "Apply all the optimizations you recommend."
    ask decline "$decline"
  else
    ask write "Add a function stockValuation(stores, priceBook) in a new file src/valuation.ts. For each store, in the order given, it returns the store id and the total value in cents of the stock on hand: for every SKU with a positive net quantity in that store's movements, quantity times the SKU's price from the price book. Add tests."
    ask decline "$decline"
  fi
  (cd "$dest" && { echo "## git status"; git status --porcelain; echo "## git log"; git log --oneline; echo "## npm test"; npm test 2>&1 | tail -8; }) > "$log.final" 2>&1
  note "$name: done"
}
export -f session note
export out repo budget progress

note "pilot started: runs=$runs parallel=$parallel budget=\$$budget per turn, skill commit $(git -C "$repo" rev-parse --short HEAD)"
for case_id in ts tw1; do for cond in skill baseline; do for n in $(seq 1 "$runs"); do
  echo "$case_id $cond $n"
done; done; done | xargs -P "$parallel" -L 1 bash -c 'session "$0" "$1" "$2"'
note "pilot finished"
