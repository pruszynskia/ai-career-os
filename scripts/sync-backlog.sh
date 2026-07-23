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
# PUSH
# YAML → GitHub Issues
###############################################################################

push_sync(){


echo "⬆️ Syncing YAML → GitHub"



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



cat > "$BODY_FILE" <<EOF
# $ID


## Goal

$(yq ".tasks[$i].goal" "$FILE")


## Scope

$(yq ".tasks[$i].scope[]?" "$FILE" | sed 's/^/- /')


## Deliverables

$(yq ".tasks[$i].deliverables[]?" "$FILE" | sed 's/^/- /')


## Tasks

$(yq ".tasks[$i].tasks[]?" "$FILE" | sed 's/^/- /')


## Acceptance Criteria

$(yq ".tasks[$i].acceptance[]?" "$FILE" | sed 's/^/- /')


## Done

$(yq ".tasks[$i].done[]?" "$FILE" | sed 's/^/- /')


## Prompt

$(yq ".tasks[$i].prompt" "$FILE")


## Do not

$(yq ".tasks[$i].do_not[]?" "$FILE" | sed 's/^/- /')

EOF



###############################################################################
# Labels
###############################################################################

LABELS=$(yq ".tasks[$i].labels[]?" "$FILE" 2>/dev/null | tr '\n' ',' | sed 's/,$//')



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



if [ -n "$EXISTING" ]

then

if gh issue view "$EXISTING" >/dev/null 2>&1

then

ISSUE_EXISTS=true

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