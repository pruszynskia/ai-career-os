#!/bin/bash
###############################################################################
# next-task.sh — pick the next task for the deploy loop.
#
# Prints exactly one of:
#   TASK-NNN               start this task next
#   INFLIGHT <id> <branch> a task branch is already checked out; finish it first
#   NONE                   the active milestone is complete
#
# Done-ness comes from git history, never the stale `status:` field in the YAML.
#
# ponytail: done-ness = "(TASK-NNN)" appears in an origin/main commit subject
# (implement-task / commit-and-push write "(TASK-NNN)"). start-task.sh's backlog
# commit deliberately omits the parenthesised form so it is not mistaken for a
# completed task. If that convention lapses, revisit.
###############################################################################
set -euo pipefail

FILE="${BACKLOG_FILE:-backlog/mvp.yaml}"

# --- done-ness predicate -----------------------------------------------------
# Test mode: ON_MAIN_TASKS="TASK-001 TASK-002" overrides git (used by the tests).
# Checked with the "set at all" test, not "non-empty" — ON_MAIN_TASKS="" (the
# nothing-merged case) must still select the fixture, not fall through to the
# real repo's git history.
if [ -n "${ON_MAIN_TASKS+set}" ]; then
  SUBJECTS=""
  on_main() { case " $ON_MAIN_TASKS " in *" TASK-$1 "*) return 0 ;; *) return 1 ;; esac; }
else
  git fetch origin --quiet 2>/dev/null || true
  SUBJECTS="$(git log origin/main --format='%s' 2>/dev/null || true)"
  # chore commits sometimes deliberately mark a task done via the
  # "(TASK-NNN)" convention (e.g. "superseded by ADR-009 (TASK-021)"), so
  # they must stay eligible for the exact heuristics below. But chore
  # commits also routinely just *mention* a task in passing while scaffolding
  # the backlog or an unrelated env/dep change ("add TASK-063", "link
  # TASK-060 to GitHub issue"), or merge from a "chore/backlog-task-NNN-..."
  # branch — none of that is the task's implementation landing. The loose
  # bare-number heuristic below reads any such mention as a word-boundary
  # match, so exclude every chore commit (prefix or branch name) from it.
  SUBJECTS_LOOSE="$(printf '%s\n' "$SUBJECTS" | grep -viE '(^chore\(|chore/)' || true)"
  # The "(TASK-NNN)" commit-subject suffix is the current convention, but the
  # repo's history used two earlier ones before it settled: a "TASK-NNN: ..."
  # prefix (roughly TASK-001..016), and before that only the PR merge commit's
  # branch name carrying "task-0NN-" (present for nearly every task up to the
  # low 060s). Checking only the current convention makes every task merged
  # under an older one read as "not on main", which then phantom-blocks any
  # later task whose depends_on names it. Recognize all three.
  on_main() {
    local n="$1"
    printf '%s\n' "$SUBJECTS" | grep -qF "(TASK-$n)" && return 0
    printf '%s\n' "$SUBJECTS" | grep -qE "^TASK-$n:" && return 0
    printf '%s\n' "$SUBJECTS_LOOSE" | grep -qiE "(^|[^0-9])task-0*$((10#$n))([^0-9]|\$)" && return 0
    return 1
  }
fi

# --- 1. in-flight: on a task branch whose task is not yet on main -----------
BRANCH="${NEXT_TASK_BRANCH:-$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '')}"
re='^[0-9]+-task-0*([0-9]+)-'
if [[ "$BRANCH" =~ $re ]]; then
  n="$(printf '%03d' "${BASH_REMATCH[1]}")"
  if ! on_main "$n"; then
    echo "INFLIGHT TASK-$n $BRANCH"
    exit 0
  fi
fi

# --- 2. walk milestones from the last one with >=1 task not on main backward
#        toward the first, and within each try the first not-on-main task
#        (ascending by number) whose every depends_on is already on main. A
#        milestone whose incomplete tasks are all blocked (e.g. waiting on an
#        even earlier milestone, as Mobile Redesign waits on Design System
#        Redesign) is not the last word — fall back to the earlier milestone
#        that actually has ready work instead of reporting NONE. -------------
MCOUNT="$(yq '.project.milestones | length' "$FILE")"
for ((m=MCOUNT-1; m>=0; m--)); do
  MS="$(yq ".project.milestones[$m]" "$FILE")"
  while IFS= read -r id; do
    [ -n "$id" ] || continue
    on_main "${id#TASK-}" && continue
    deps_ok=1
    while IFS= read -r dep; do
      [ -n "$dep" ] || continue
      on_main "${dep#TASK-}" || { deps_ok=0; break; }
    done < <(yq ".tasks[] | select(.id == \"$id\") | .depends_on[]?" "$FILE")
    [ "$deps_ok" = 1 ] && { echo "$id"; exit 0; }
  done < <(yq ".tasks[] | select(.milestone == \"$MS\") | .id" "$FILE" | sort -t- -k2 -n)
done

# --- 3. nothing runnable in any incomplete milestone --------------------------
echo "NONE"
