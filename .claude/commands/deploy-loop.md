# Deploy Loop Command

One command that starts the unattended deployment loop — the launcher for
`/loop /deploy-cycle` so you don't have to type the `/loop` wrapper.

Input:

None. (Autonomy stays whatever `.claude/deploy-loop-state.json` says —
`pr-only` by default. Change it there, not here.)

## Steps

1. Preflight — abort with a one-line reason if any fails:
   - `git rev-parse --abbrev-ref HEAD` is `main`.
   - `git status --porcelain` is empty (clean working tree).
   - `git fetch origin -q && git status -sb` shows `main` not behind
     `origin/main` (or fast-forward it).
   - `./scripts/next-task.sh` prints a `TASK-NNN` (not `NONE`, not
     `INFLIGHT`). Report what it printed.

2. Reset the loop state to a clean idle slate in
   `.claude/deploy-loop-state.json` (it is gitignored):
   `task`, `issue`, `pr`, `phase`, `last_error` → `null`;
   `fix_round`, `ticks`, `consecutive_failures` → `0`;
   `review_verdict` → `null`; keep `autonomy`; set
   `budget.deadline` to 4 hours from now (ISO-8601 Z).

3. Start the loop: invoke the `loop` skill with args `/deploy-cycle`
   (`Skill({skill: "loop", args: "/deploy-cycle"})`). That runs one tick now
   and self-paces the rest via `ScheduleWakeup`; each subsequent tick
   re-enters through `/loop /deploy-cycle`.

## Output

- Preflight result (branch, tree state, next task id)
- Confirmation the state file was reset (new `deadline`)
- That the loop is running and will STOP at the first "PR ready for review"
  under `pr-only`

## Do not

- Do not flip `autonomy` to `auto-merge` from here — that is a deliberate,
  separate edit after several clean supervised cycles.
- Do not start if preflight fails — fix the branch/tree first.
