# Backlog

`backlog.template.yaml` is the seed for your project's `backlog/mvp.yaml` —
the single source of truth for implementation tasks, synced to GitHub Issues
via `scripts/sync-backlog.sh`.

## Setup

1. Rename this file to `backlog/mvp.yaml` in your new repo.
2. Fill in `project.github.repository` and `project.name`.
3. Replace the example `TASK-001` with your real tasks.

## Conventions

- **IDs**: sequential, `TASK-001`, `TASK-002`, ... never reused, never
  reordered even if a task is dropped.
- **`depends_on`**: list of task IDs that must be `done` first. Keeps
  `/implement-task` from starting work whose prerequisites don't exist yet.
- **`status`**: one of `backlog`, `todo`, `in-progress`, `review`, `blocked`,
  `done`. `scripts/sync-backlog.sh pull` updates this automatically from the
  linked GitHub Issue's open/closed state (to `in_progress`/`done`).
- **`github.issue`**: left `null` until `scripts/sync-backlog.sh push` creates
  the Issue and writes the number back.
- **One task, one concern**: each task should be implementable and reviewable
  independently. If a task's `scope` list is sprawling, split it.

See `templates/TASK.md` for the field-by-field template this schema is based
on, and `WORKFLOW.md` for how the backlog fits into the full project loop.
