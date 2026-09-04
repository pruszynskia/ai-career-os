# Recommended Workflow

The full loop this starter kit is built around, and which file/command
covers each step.

## 1. Idea

Write down what you're building and why. No template needed yet — a
paragraph in a scratch doc or issue is enough.

## 2. Planning

Turn the idea into product scope: `docs/PRODUCT.md` (vision, users, MVP
scope, roadmap). Use `templates/PROJECT_PLANNING.md` if you need a
heavier planning doc first.

## 3. Architecture

Decide the stack and structure: `docs/TECH_STACK.md` (what you're using
and why) and `ARCHITECTURE.md` (folder structure, data flow, dependency
rules). Record any non-obvious choice as an ADR using `templates/ADR.md`,
appended to `memory-bank/decisions.md`.

## 4. Generate backlog

Break the plan into tasks in `backlog/mvp.yaml` (seeded from
`backlog/backlog.template.yaml`), one entry per task following
`templates/TASK.md`'s field shape. Order by `depends_on`.

## 5. Generate GitHub Issues

```
./scripts/sync-backlog.sh push
```

Each task becomes (or updates) one GitHub Issue, body generated from the
task's `goal`/`scope`/`acceptance`/`prompt`/`do_not` fields.

## 6. Implement with Claude

```
/implement-task TASK-ID
```

One task at a time — see `claude/commands/implement-task.md`. Claude loads
`CLAUDE.md` → `AI_RULES.md` → `ARCHITECTURE.md` → the task, implements only
that task's scope, then runs lint/typecheck/build.

## 7. Review

```
/review-task TASK-ID
```

Checks architecture adherence, code quality, and edge cases against the
task and `AI_RULES.md`. If issues surface:

```
/fix-task TASK-ID
```

## 8. Deploy

Push, let CI (`github/workflows/ci.yml`) run lint + build, merge, deploy.
Keep infra minimal — see the deployment task shape in
`backlog/backlog.template.yaml`'s do-not list for the spirit of this ("don't
over-engineer deployment").

**Autonomous path.** Steps 6–9 also run unattended as `/loop /deploy-cycle`
(`claude/commands/deploy-cycle.md`): implement → review (independent model) →
fix (≤1 round, else escalate) → commit → open PR linked to the issue +
GitHub Project → wait for CI and the Vercel build → merge → sync `main` →
verify the production deploy → `scripts/next-task.sh` picks the next task →
repeat. The merge gate and all hard caps are in `scripts/merge-gate.sh` and
GitHub branch protection, not the prompt. Ships at `autonomy: pr-only` (stops
with the PR open); see `memory-bank/deploy-loop-research.md` and `ADR-015`.

## 9. Iterate

```
./scripts/sync-backlog.sh pull
```

Pulls Issue state back into the YAML (`open` → `in_progress`, closed →
`done`). Update `memory-bank/current-task.md` and
`memory-bank/project-context.md`, then return to step 4 for the next batch
of tasks.
