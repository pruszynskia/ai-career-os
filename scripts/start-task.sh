#!/bin/bash
###############################################################################
# start-task.sh TASK-NNN [--dry-run]
#
# Cut the branch for a task from a fresh main:
#   1. checkout main, fetch, fast-forward pull
#   2. ensure the GitHub issue exists (reuse one matching "[TASK-NNN]" in title
#      even if backlog/mvp.yaml still has github.issue: null)
#   3. gh issue develop  — create + link + checkout the <issue>-task-<nnn>-<slug>
#      branch server-side
#   4. link the issue into the "AI Career OS MVP" project, store the item id
#   5. commit the backlog YAML change on the new branch
#
# --dry-run prints every git / gh command and runs nothing.
###############################################################################
set -euo pipefail

FILE="backlog/mvp.yaml"
DIR="$(cd "$(dirname "$0")" && pwd)"
source "$DIR/lib/issue-body.sh"

PROJECT="AI Career OS MVP"
PROJECT_OWNER="pruszynskia"

ID=""
DRY=0
for a in "$@"; do
  case "$a" in
    --dry-run) DRY=1 ;;
    TASK-*)    ID="$a" ;;
    *) echo "usage: start-task.sh TASK-NNN [--dry-run]" >&2; exit 1 ;;
  esac
done
[ -n "$ID" ] || { echo "usage: start-task.sh TASK-NNN [--dry-run]" >&2; exit 1; }

run() { echo "+ $*"; [ "$DRY" = 1 ] || "$@"; }

IDX="$(yq ".tasks | to_entries | map(select(.value.id == \"$ID\")) | .[0].key // \"\"" "$FILE")"
[ -n "$IDX" ] && [ "$IDX" != "null" ] || { echo "unknown task $ID in $FILE" >&2; exit 1; }

TITLE="$(yq ".tasks[$IDX].title" "$FILE")"
ISSUE="$(yq ".tasks[$IDX].github.issue" "$FILE")"
MILESTONE="$(yq ".tasks[$IDX].milestone" "$FILE")"

LABEL_ARGS=()
while IFS= read -r l; do [ -n "$l" ] && LABEL_ARGS+=(--label "$l"); done \
  < <(yq ".tasks[$IDX].labels[]?" "$FILE")

MS_ARGS=()
[ "$MILESTONE" != "null" ] && [ -n "$MILESTONE" ] && MS_ARGS=(--milestone "$MILESTONE")

# Remember the starting branch before we move off it (matters for --dry-run and
# for adopting a task whose branch already exists).
START_BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '')"
NNN="${ID#TASK-}"

# --- 1. fresh main --------------------------------------------------------------
run git checkout main
run git fetch origin
run git pull --ff-only

# --- 2. ensure the issue exists ----------------------------------------------
if [ "$ISSUE" = "null" ] || [ -z "$ISSUE" ]; then
  EXISTING="$(gh issue list --state all --search "in:title [$ID]" \
    --json number,title \
    --jq ".[] | select(.title | startswith(\"[$ID]\")) | .number" 2>/dev/null | head -1 || true)"
  if [ -n "$EXISTING" ]; then
    ISSUE="$EXISTING"
    echo "found existing issue #$ISSUE for $ID (backlog YAML was stale)"
    [ "$DRY" = 1 ] || yq -i ".tasks[$IDX].github.issue = \"$ISSUE\"" "$FILE"
  elif [ "$DRY" = 1 ]; then
    echo "+ gh issue create --title \"[$ID] $TITLE\" --body-file <build_issue_body $IDX> ${LABEL_ARGS[*]:-} ${MS_ARGS[*]:-}"
    ISSUE="<new-issue>"
  else
    BODY_FILE="$(mktemp)"
    build_issue_body "$IDX" > "$BODY_FILE"
    URL="$(gh issue create --title "[$ID] $TITLE" --body-file "$BODY_FILE" \
      ${LABEL_ARGS[@]+"${LABEL_ARGS[@]}"} ${MS_ARGS[@]+"${MS_ARGS[@]}"})"
    rm -f "$BODY_FILE"
    ISSUE="$(printf '%s' "$URL" | grep -oE '[0-9]+$')"
    echo "created issue #$ISSUE"
    yq -i ".tasks[$IDX].github.issue = \"$ISSUE\"" "$FILE"
  fi
else
  echo "issue #$ISSUE already recorded for $ID"
fi

# --- 3. create + link + checkout the issue branch -------------------------
case "$START_BRANCH" in
  *"task-$NNN-"*)
    echo "already on branch $START_BRANCH for $ID — skipping 'gh issue develop'" ;;
  *)
    run gh issue develop "$ISSUE" --base main --checkout ;;
esac

# --- 4. link the issue to the GitHub Project --------------------------------
if [ "$DRY" = 1 ]; then
  echo "+ gh project item-add \"$PROJECT\" --owner $PROJECT_OWNER --url <issue #$ISSUE url>"
else
  ISSUE_URL="$(gh issue view "$ISSUE" --json url --jq .url)"
  ITEM_ID="$(gh project item-add "$PROJECT" --owner "$PROJECT_OWNER" --url "$ISSUE_URL" \
    --format json --jq .id 2>/dev/null || true)"
  if [ -n "$ITEM_ID" ]; then
    yq -i ".tasks[$IDX].github.project_item = \"$ITEM_ID\"" "$FILE"
    echo "linked issue #$ISSUE to project (item $ITEM_ID)"
  else
    echo "warning: could not add issue #$ISSUE to project '$PROJECT' (run: gh auth refresh -s project,read:project)" >&2
  fi
fi

# --- 5. commit the backlog change on the new branch -----------------------
# ponytail: subject deliberately omits "(TASK-NNN)" so next-task.sh does not
# read this bookkeeping commit as the task being done.
if [ "$DRY" = 1 ]; then
  echo "+ git add $FILE && git commit -m \"chore(backlog): link $ID to GitHub issue and project\""
elif ! git diff --quiet -- "$FILE"; then
  git add "$FILE"
  git commit -m "chore(backlog): link $ID to GitHub issue and project"
else
  echo "backlog YAML unchanged — nothing to commit"
fi

echo "start-task: $ID ready on $(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '<branch>')"
