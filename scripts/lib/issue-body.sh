#!/bin/bash
###############################################################################
# build_issue_body <task-index>
#
# Prints the GitHub issue body for .tasks[<index>] of $FILE (the backlog YAML).
# Extracted verbatim from sync-backlog.sh so the backlog sync and the deploy
# loop render byte-identical issue bodies. Behaviour-preserving: relies on
# $FILE being set and `yq` being on PATH in the caller's environment.
###############################################################################

build_issue_body() {

local i="$1"

cat <<EOF
# $(yq ".tasks[$i].id" "$FILE")


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
}
