#!/bin/bash
###############################################################################
# Self-check for merge-gate.sh. Asserts each guard trips independently against
# fixture inputs. Plain `set -e` + `[ ]`, no framework.
#   bash scripts/merge-gate.test.sh
###############################################################################
set -e

DIR="$(cd "$(dirname "$0")" && pwd)"
GATE_LIB=1 . "$DIR/merge-gate.sh"
set +u

# Each guard calls `fail` -> exit 1. Run it in a subshell so the exit stays
# contained, and check the subshell's status.
trips()  { if ( "$@" ) 2>/dev/null; then echo "FAIL: expected BLOCK from: $*"; exit 1; fi; echo "ok - blocks: $*"; }
passes() { if ( "$@" ) 2>/dev/null; then echo "ok - allows: $*"; else echo "FAIL: expected OK from: $*"; exit 1; fi; }
paths()  { printf '%s\n' "$1" | check_paths; }

# --- path guard ------------------------------------------------------------
trips  paths "package.json"
trips  paths "supabase/migrations/003.sql"
trips  paths "src/shared/auth/actions.ts"
passes paths "src/app/sign-in/page.tsx"

# --- size guard ----------------------------------------------------------
trips  check_size 16 100
trips  check_size 10 401
passes check_size 15 400

# --- review verdict / fix rounds --------------------------------------------
trips  check_verdict "Not-approved" 0
trips  check_verdict "Approved" 2
passes check_verdict "Approved" 1
passes check_verdict "Approved" 0

# --- branch behind base ------------------------------------------------------
trips  check_not_behind 2
passes check_not_behind 0

# --- shortstat parsing -----------------------------------------------------
[ "$(printf ' 3 files changed, 12 insertions(+), 4 deletions(-)\n' | parse_shortstat)" = "3 16" ] \
  && echo "ok - parse_shortstat: 3 files / 16 lines" || { echo "FAIL: parse_shortstat multi"; exit 1; }
[ "$(printf ' 1 file changed, 2 insertions(+)\n' | parse_shortstat)" = "1 2" ] \
  && echo "ok - parse_shortstat: 1 file / 2 lines" || { echo "FAIL: parse_shortstat single"; exit 1; }
[ "$(printf '\n' | parse_shortstat)" = "0 0" ] \
  && echo "ok - parse_shortstat: empty diff" || { echo "FAIL: parse_shortstat empty"; exit 1; }

echo "all merge-gate.sh checks passed"
