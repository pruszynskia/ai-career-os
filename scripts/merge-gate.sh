#!/bin/bash
###############################################################################
# merge-gate.sh <pr> <review_verdict> <fix_round>
#
# The deterministic merge gate (plan F3/F6). Exit 0 = the loop may merge.
# Non-zero + a reason on stderr = a human must merge. No model judgment here —
# every check is git / gh only.
#
# Checks, in order:
#   1. gh pr checks <pr>            — all checks green (exit 0; 8 = pending)
#   2. changed-path guard           — no protected path in the diff
#   3. size guard                   — <=15 files and <=400 changed lines
#   4. review verdict + fix rounds  — "Approved" and fix_round <= 1
#   5. branch not behind base
#
# Source with GATE_LIB=1 to load the check_* functions without running.
###############################################################################
set -euo pipefail

BASE="${GATE_BASE:-origin/main}"

# Protected paths (plan F6). A diff touching any of these needs a human merge.
GUARDED_RE='^(package\.json|package-lock\.json|supabase/migrations/|\.github/workflows/|vercel\.json|\.env|src/proxy\.ts|src/shared/auth/)'

fail() { echo "merge-gate: BLOCKED — $1" >&2; exit 1; }

check_checks() { # <pr>
  gh pr checks "$1" >/dev/null 2>&1 || fail "PR #$1 checks are not all green (pending or failing)"
}

check_paths() { # reads `git diff --name-only` on stdin
  local hit
  hit="$(grep -E "$GUARDED_RE" || true)"
  [ -z "$hit" ] || fail "protected path(s) in diff: $(printf '%s' "$hit" | tr '\n' ' ')"
}

check_size() { # <files> <changed-lines>
  [ "${1:-0}" -le 15 ]  || fail "diff touches $1 files (>15) — human merge"
  [ "${2:-0}" -le 400 ] || fail "diff changes $2 lines (>400) — human merge"
}

check_verdict() { # <verdict> <fix_round>
  [ "$1" = "Approved" ]     || fail "review verdict is '$1', not Approved"
  [ "${2:-0}" -le 1 ]       || fail "fix_round $2 > 1 — escalate to human (plan F1)"
}

check_not_behind() { # <commits-behind>
  [ "${1:-0}" -eq 0 ] || fail "branch is $1 commit(s) behind $BASE — rebase first"
}

# --- parse `git diff --shortstat` into "<files> <lines>" --------------------
parse_shortstat() {
  awk '{
    f=0; l=0;
    for (i=1; i<=NF; i++) {
      if ($i ~ /file/)                 f = $(i-1);
      if ($i ~ /insertion|deletion/)   l += $(i-1);
    }
    print f+0, l+0;
  }'
}

[ "${GATE_LIB:-}" = "1" ] && return 0

PR="${1:?usage: merge-gate.sh <pr> <review_verdict> <fix_round>}"
VERDICT="${2:?usage: merge-gate.sh <pr> <review_verdict> <fix_round>}"
FIX_ROUND="${3:-0}"

git fetch origin --quiet 2>/dev/null || true

check_checks "$PR"
git diff --name-only "$BASE...HEAD" | check_paths
read -r NF NL < <(git diff --shortstat "$BASE...HEAD" | parse_shortstat)
check_size "${NF:-0}" "${NL:-0}"
check_verdict "$VERDICT" "$FIX_ROUND"
check_not_behind "$(git rev-list --count "HEAD..$BASE" 2>/dev/null || echo 0)"

echo "merge-gate: OK — PR #$PR may merge"
