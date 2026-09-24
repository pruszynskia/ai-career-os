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
   - `CONTINUE` → the next transition is ready now; call the orchestrator
     again immediately (same turn), don't `ScheduleWakeup` a delay first.
     Only stop chaining ticks to end the turn when the status becomes WAIT,
     STOP, or BLOCKED, or a phase genuinely needs external time to pass.
   - `WAIT` → `ScheduleWakeup` in ~600 s (GitHub / Vercel is doing the work,
     or a PR is open under `pr-only` awaiting Andrzej's manual merge — see
     Autonomy below). Poll on a longer interval (~900 s) if repeated polls
     come back unchanged.
   - `STOP` or genuine `BLOCKED` (needs a human decision, not just a pending
     merge) → `ScheduleWakeup stop:true` and surface the `reason` to Andrzej.

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

- `"pr-only"` (default) — open the PR and do NOT auto-merge; Andrzej merges
  by hand. The loop does not stop and wait for a "resume" — it keeps polling
  (`WAIT`, ~600-900 s) until the PR shows `mergedAt` set, then continues
  straight into sync/next-task on its own. Only a genuine `merge-gate.sh`
  refusal (oversized diff, failing check, etc.) or another real stop
  condition ends the loop early.
- `"auto-merge"` — run `merge-gate.sh`, then `gh pr merge --auto`; GitHub
  merges the moment the required `build` check goes green.

Default is `pr-only` — keep it that way; only flip the field to `auto-merge`
if Andrzej explicitly asks for it again.

## One-time setup

- `gh auth refresh -s project,read:project` (for `gh project item-add`).
- Branch protection on `main`: require the `build` status check. This is what
  makes `gh pr merge --auto` safe — GitHub itself refuses a red merge.
