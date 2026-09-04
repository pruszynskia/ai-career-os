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
if [ -n "${ON_MAIN_TASKS:-}" ]; then
  SUBJECTS=""
  on_main() { case " $ON_MAIN_TASKS " in *" TASK-$1 "*) return 0 ;; *) return 1 ;; esac; }
else
  git fetch origin --quiet 2>/dev/null || true
  SUBJECTS="$(git log origin/main --format='%s' 2>/dev/null || true)"
  # TASK-001..015 (the original MVP) were merged before commit subjects carried
  # "(TASK-NNN)". They are permanently done — hardcode them so downstream
  # depends_on resolves. Every task since does carry the parenthesised form.
  PRE_CONVENTION_DONE=" 001 002 003 004 005 006 007 008 009 010 011 012 013 014 015 "
  on_main() {
    case "$PRE_CONVENTION_DONE" in *" $1 "*) return 0 ;; esac
    printf '%s\n' "$SUBJECTS" | grep -qF "(TASK-$1)"
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

# --- 2. active milestone: last milestones[] entry with >=1 task not on main -
MCOUNT="$(yq '.project.milestones | length' "$FILE")"
ACTIVE=""
for ((m=MCOUNT-1; m>=0; m--)); do
  MS="$(yq ".project.milestones[$m]" "$FILE")"
  while IFS= read -r id; do
    [ -n "$id" ] || continue
    if ! on_main "${id#TASK-}"; then ACTIVE="$MS"; break; fi
  done < <(yq ".tasks[] | select(.milestone == \"$MS\") | .id" "$FILE")
  [ -n "$ACTIVE" ] && break
done
[ -n "$ACTIVE" ] || { echo "NONE"; exit 0; }

# --- 3. first task in the active milestone, ascending by number,
#        not on main, with every depends_on already on main ------------------
while IFS= read -r id; do
  [ -n "$id" ] || continue
  on_main "${id#TASK-}" && continue
  deps_ok=1
  while IFS= read -r dep; do
    [ -n "$dep" ] || continue
    on_main "${dep#TASK-}" || { deps_ok=0; break; }
  done < <(yq ".tasks[] | select(.id == \"$id\") | .depends_on[]?" "$FILE")
  [ "$deps_ok" = 1 ] && { echo "$id"; exit 0; }
done < <(yq ".tasks[] | select(.milestone == \"$ACTIVE\") | .id" "$FILE" | sort -t- -k2 -n)

# --- 4. nothing runnable --------------------------------------------------------
echo "NONE"
