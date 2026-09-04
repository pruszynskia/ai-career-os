# Deploy Cycle Command

The body of the autonomous deployment loop. One invocation = one tick =
one phase transition. Wrap it in `/loop` to run unattended:

```
/loop /deploy-cycle
```

`/loop` with no interval lets this command pace itself via `ScheduleWakeup`.

## What it does

Continues the per-task chain past "pushed" — open PR (linked to the issue +
GitHub Project) → wait for CI and the Vercel build → merge → sync `main` →
verify the production deploy → cut the next branch → pick the next task →
repeat. All hard limits and the merge gate live in scripts and on GitHub, not
in this prompt (plan findings F3/F4).

## Steps

1. `Agent(subagent_type: "deploy-orchestrator", prompt: "Advance the deploy
   loop one step.")`. It reads `.claude/deploy-loop-state.json`, checks
   budgets, does exactly one transition, writes state + ledger, returns JSON.

2. Print its JSON `status` + `reason` as **one** human line, e.g.
   `deploy-loop: CONTINUE — TASK-054 implement → review`.

3. Pace the next tick:
   - `CONTINUE` → `ScheduleWakeup` in ~120 s.
   - `WAIT` → `ScheduleWakeup` in ~600 s (GitHub / Vercel is doing the work).
   - `STOP` or `BLOCKED` → `ScheduleWakeup stop:true` and surface the `reason`
     to Andrzej.

The main `/loop` session only ever holds this thin dispatcher — it grows
~10 lines per tick. Everything heavy happens in the discarded orchestrator and
phase subagents.

## Stop conditions

The loop stops (`STOP`/`BLOCKED`) on: milestone complete; `needs-decision`
from `deploy-impl`; Not-approved after 2 fix rounds; `merge-gate.sh` refused;
PR closed unmerged; merge conflict against `origin/main`; production deploy
failed; any budget cap tripped (`max_ticks_per_task` 20, `max_tasks_per_run`
5, `consecutive_failures` 3, wall-clock `deadline`).

## Autonomy

`.claude/deploy-loop-state.json` carries `"autonomy"`:

- `"pr-only"` (default) — stop with the PR open; Andrzej merges by hand.
- `"auto-merge"` — run `merge-gate.sh`, then `gh pr merge --auto`; GitHub
  merges the moment the required `build` check goes green.

Ship at `pr-only`; flip the field to `auto-merge` only after several clean
supervised cycles (plan F10).

## One-time setup

- `gh auth refresh -s project,read:project` (for `gh project item-add`).
- Branch protection on `main`: require the `build` status check. This is what
  makes `gh pr merge --auto` safe — GitHub itself refuses a red merge.
