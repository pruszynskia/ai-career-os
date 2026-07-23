# Task Template

Copy this shape into `backlog/mvp.yaml` as one list entry per task. This is
the schema `.claude/commands/implement-task.md` and `scripts/sync-backlog.sh`
both expect.

```yaml
- id: TASK-NNN
  github:
    issue: null # filled in by scripts/sync-backlog.sh push
    project_item: null
  status: backlog # backlog | todo | in-progress | review | blocked | done
  priority: P0 # P0 | P1 | P2 | P3
  estimate: S # XS | S | M | L | XL
  depends_on: [] # e.g. [TASK-001, TASK-002]
  title: <Short imperative title>
  goal: >
    <One or two sentences: what this task achieves and why>
  scope:
    - <file or folder this task is allowed to touch>
  deliverables:
    - <concrete artifact produced>
  tasks:
    - <ordered implementation step>
  acceptance:
    - <objective, checkable condition>
  done:
    - <what "done" looks like once acceptance criteria pass>
  context:
    architecture:
      - <architecture doc section this task relates to>
    standards:
      - <standards doc section this task relates to>
  references:
    - docs/<relevant-doc>.md
  prompt: |
    <The instruction handed to Claude for /implement-task — scope it tightly>
  do_not:
    - <explicit thing to avoid, e.g. "add unnecessary dependencies">
```

## Field reference

| Field          | Purpose                                                                   |
| -------------- | ------------------------------------------------------------------------- |
| `goal`         | Why this task exists — the outcome, not the steps                         |
| `scope`        | Files/folders allowed; everything else must stay untouched                |
| `deliverables` | Nouns — what exists once this is done                                     |
| `tasks`        | Verbs — the ordered steps to get there                                    |
| `acceptance`   | How a reviewer checks the task is actually done                           |
| `prompt`       | The literal instruction Claude follows — keep it scoped to this task only |
| `do_not`       | Guardrails against scope creep and over-engineering                       |
| `depends_on`   | Task IDs that must be `done` before this one can start                    |

## Risk and checklist (optional, for larger tasks)

For `M`/`L`/`XL` estimates, add a short risk note and pre-flight checklist
directly in the task's `prompt` or as extra `context` fields — don't grow the
schema for a one-off; freeform text inside an existing field is enough.

```yaml
risk: >
  <What could break, and the blast radius if it does>
checklist:
  - <pre-implementation check, e.g. "confirm no existing util covers this">
```
