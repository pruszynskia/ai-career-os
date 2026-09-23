#!/bin/bash

set -e


###############################################################################
# GitHub Backlog Sync
#
# Usage:
#
# ./scripts/sync-backlog.sh push
# ./scripts/sync-backlog.sh pull
#
###############################################################################


FILE="backlog/mvp.yaml"

MODE=${1:-push}

# Issue body rendering is shared with the deploy loop (scripts/next-task.sh etc).
source "$(dirname "$0")/lib/issue-body.sh"



echo "🔄 Backlog sync mode: $MODE"



###############################################################################
# Dependencies
###############################################################################

if ! command -v yq &> /dev/null
then
  echo "❌ yq is required"
  exit 1
fi


if ! command -v gh &> /dev/null
then
  echo "❌ GitHub CLI is required"
  exit 1
fi



###############################################################################
# Milestones
# Ensures every milestone declared in project.milestones exists on GitHub, and
# builds a title -> number lookup (MILESTONE_MAP_FILE) for push_sync.
#
# `gh issue create/edit --milestone <title>` only resolves OPEN milestones —
# it 404s on a closed one even to re-set the value an issue already has. Once
# an early-stage milestone (MVP, Stage 0, ...) gets closed as that stage
# wraps, every task still filed under it becomes unsyncable via that flag.
# So milestone assignment is done separately via the REST API by number
# (assign_milestone below), which accepts any milestone regardless of state.
###############################################################################

MILESTONE_MAP_FILE=""

ensure_milestones(){


REPO=$(yq '.project.github.repository' "$FILE")

MILESTONE_MAP_FILE=$(mktemp)
trap 'rm -f "$MILESTONE_MAP_FILE"' EXIT

gh api "repos/$REPO/milestones?state=all" --paginate -q '.[] | "\(.title)\t\(.number)"' \
  > "$MILESTONE_MAP_FILE" 2>/dev/null || true

MILESTONE_COUNT=$(yq '.project.milestones | length' "$FILE")



for ((m=0;m<MILESTONE_COUNT;m++))
do

MS_TITLE=$(yq ".project.milestones[$m]" "$FILE")

if ! awk -F'\t' -v t="$MS_TITLE" '$1==t{found=1} END{exit !found}' "$MILESTONE_MAP_FILE"

then

echo "🏁 Creating milestone: $MS_TITLE"
NEW_NUM=$(gh api "repos/$REPO/milestones" -f title="$MS_TITLE" -f state=open -q .number)
printf '%s\t%s\n' "$MS_TITLE" "$NEW_NUM" >> "$MILESTONE_MAP_FILE"

fi

done

}

# assign_milestone <issue-number> <milestone-title>
# No-op if the title isn't in the map (shouldn't happen after ensure_milestones).
assign_milestone(){

MNUM=$(awk -F'\t' -v t="$2" '$1==t{print $2; exit}' "$MILESTONE_MAP_FILE")

if [ -n "$MNUM" ]

then

gh api "repos/$REPO/issues/$1" -X PATCH -f milestone="$MNUM" >/dev/null

else

echo "⚠️ milestone '$2' not found for issue #$1" >&2

fi

}



###############################################################################
# PUSH
# YAML → GitHub Issues
###############################################################################

push_sync(){


echo "⬆️ Syncing YAML → GitHub"



ensure_milestones

PROJECT=$(yq '.project.github.project' "$FILE")



TASK_COUNT=$(yq '.tasks | length' "$FILE")



for ((i=0;i<TASK_COUNT;i++))
do


ID=$(yq ".tasks[$i].id" "$FILE")

TITLE=$(yq ".tasks[$i].title" "$FILE")


echo ""
echo "--------------------------------"
echo "Processing $ID"
echo "--------------------------------"



###############################################################################
# Create Issue Body
###############################################################################

BODY_FILE=$(mktemp)

build_issue_body "$i" > "$BODY_FILE"



###############################################################################
# Labels
###############################################################################

LABELS=$(yq ".tasks[$i].labels[]?" "$FILE" 2>/dev/null | tr '\n' ',' | sed 's/,$//')



###############################################################################
# Milestone
###############################################################################

MILESTONE=$(yq ".tasks[$i].milestone" "$FILE")

if [ "$MILESTONE" = "null" ] || [ -z "$MILESTONE" ]

then

MILESTONE=""

fi




###############################################################################
# Check Issue from YAML
###############################################################################

EXISTING=$(yq ".tasks[$i].github.issue" "$FILE")



if [ "$EXISTING" = "null" ] || [ -z "$EXISTING" ]

then

EXISTING=""

fi



###############################################################################
# Validate if GitHub Issue still exists
###############################################################################

ISSUE_EXISTS=false



# Only a real 404 means "recreate it". Any other failure (network reset, rate
# limit) must abort — treating it as missing files a duplicate issue.
if [ -n "$EXISTING" ]

then

if CHECK_ERR=$(gh api "repos/$REPO/issues/$EXISTING" --silent 2>&1)

then

ISSUE_EXISTS=true

elif ! grep -q "HTTP 404" <<< "$CHECK_ERR"

then

echo "❌ could not check issue #$EXISTING for $ID: $CHECK_ERR" >&2
exit 1

fi

fi



###############################################################################
# Update existing Issue
###############################################################################

if [ "$ISSUE_EXISTS" = true ]

then


echo "♻️ Updating $ID (#$EXISTING)"



gh issue edit "$EXISTING" \
--body-file "$BODY_FILE"



ISSUE=$EXISTING



###############################################################################
# Create new Issue
###############################################################################

else


echo "🆕 Creating $ID"



if [ -z "$LABELS" ]

then


ISSUE_URL=$(gh issue create \
--title "[$ID] $TITLE" \
--body-file "$BODY_FILE")


else


ISSUE_URL=$(gh issue create \
--title "[$ID] $TITLE" \
--body-file "$BODY_FILE" \
--label "$LABELS")


fi



ISSUE=$(echo "$ISSUE_URL" | grep -o '[0-9]*$')



echo "Created issue #$ISSUE"



fi



###############################################################################
# Assign Milestone (by number, so a closed milestone still works)
###############################################################################

if [ -n "$MILESTONE" ]

then

assign_milestone "$ISSUE" "$MILESTONE"

fi



###############################################################################
# Link to GitHub Project
# Don't rely on the project's "Auto-add" workflow — it silently drops issues
# created in a burst. item-add is idempotent: an issue already on the board
# returns its existing item id.
###############################################################################

ITEM_ID=$(gh project item-add "$PROJECT" --owner "${REPO%%/*}" \
--url "https://github.com/$REPO/issues/$ISSUE" --format json --jq .id)

yq -i \
".tasks[$i].github.project_item = \"$ITEM_ID\"" \
"$FILE"



###############################################################################
# Save Issue number
###############################################################################

yq -i \
".tasks[$i].github.issue = \"$ISSUE\"" \
"$FILE"



rm "$BODY_FILE"



done



echo ""
echo "✅ Push completed"

}




###############################################################################
# PULL
# GitHub → YAML
###############################################################################

pull_sync(){


echo "⬇️ Syncing GitHub → YAML"



TASK_COUNT=$(yq '.tasks | length' "$FILE")



for ((i=0;i<TASK_COUNT;i++))
do


ID=$(yq ".tasks[$i].id" "$FILE")



ISSUE=$(yq ".tasks[$i].github.issue" "$FILE")



if [ "$ISSUE" != "null" ]

then



if gh issue view "$ISSUE" >/dev/null 2>&1

then



STATE=$(gh issue view "$ISSUE" \
--json state \
--jq '.state')



echo "Updating $ID"



if [ "$STATE" = "OPEN" ]

then

yq -i \
".tasks[$i].status = \"in_progress\"" \
"$FILE"


else


yq -i \
".tasks[$i].status = \"done\"" \
"$FILE"


fi



MILESTONE_TITLE=$(gh issue view "$ISSUE" \
--json milestone \
--jq '.milestone.title // ""')

if [ -n "$MILESTONE_TITLE" ]

then

yq -i \
".tasks[$i].milestone = \"$MILESTONE_TITLE\"" \
"$FILE"

fi



fi



fi



done



echo ""
echo "✅ Pull completed"

}





###############################################################################
# MAIN
###############################################################################

case "$MODE" in


push)

push_sync
;;


pull)

pull_sync
;;


*)

echo ""
echo "Usage:"
echo "./scripts/sync-backlog.sh push"
echo "./scripts/sync-backlog.sh pull"
echo ""

exit 1

;;

esac