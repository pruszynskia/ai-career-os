#!/bin/bash
###############################################################################
# Self-check for next-task.sh. Plain `set -e` + `[ ]` asserts, no framework.
#   bash scripts/next-task.test.sh
###############################################################################
set -e

DIR="$(cd "$(dirname "$0")" && pwd)"
FIX="$(mktemp -t next-task-fixture.XXXXXX)"
trap 'rm -f "$FIX"' EXIT

cat > "$FIX" <<'YAML'
project:
  milestones:
    - Alpha
    - Beta
tasks:
  - id: TASK-001
    milestone: Alpha
    depends_on: []
  - id: TASK-002
    milestone: Beta
    depends_on: [TASK-001]
  - id: TASK-003
    milestone: Beta
    depends_on: [TASK-002]
  - id: TASK-004
    milestone: Beta
    depends_on: [TASK-099]
  - id: TASK-005
    milestone: Beta
    depends_on: [TASK-001]
YAML

run() { # run <ON_MAIN_TASKS>
  BACKLOG_FILE="$FIX" NEXT_TASK_BRANCH="main" ON_MAIN_TASKS="$1" bash "$DIR/next-task.sh"
}
assert() { # assert <label> <expected> <actual>
  if [ "$2" != "$3" ]; then echo "FAIL: $1 — expected [$2] got [$3]"; exit 1; fi
  echo "ok - $1"
}

# satisfied-deps task is picked: 001 on main -> Beta active -> 002's dep met
assert "picks task with satisfied deps" "TASK-002" "$(run 'TASK-001')"

# blocked task is skipped: 002/003 need 001; 004 needs missing 099; 005 needs 001
assert "skips dependency-blocked task, picks next runnable" \
  "TASK-005" "$(run 'TASK-001 TASK-002 TASK-003')"

# merged task is not re-picked: 002 done -> next is 003 (dep 002 met)
assert "does not re-pick a merged task" "TASK-003" "$(run 'TASK-001 TASK-002')"

# milestone fallback: all of Beta merged but Alpha not -> Alpha is active
assert "falls back to earlier incomplete milestone" \
  "TASK-001" "$(run 'TASK-002 TASK-003 TASK-004 TASK-005')"

# everything merged -> NONE
assert "reports NONE when active milestone complete" \
  "NONE" "$(run 'TASK-001 TASK-002 TASK-003 TASK-004 TASK-005')"

# nothing merged -> Beta active, but every Beta task blocked on unmet dep -> NONE
assert "reports NONE when active milestone fully blocked" \
  "NONE" "$(run '')"

echo "all next-task.sh checks passed"
