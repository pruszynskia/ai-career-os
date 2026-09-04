---
name: deploy-commit
description: Deploy-loop commit phase. Runs /commit-and-push for the loop's current task and returns a strict JSON object. Spawned only by deploy-orchestrator.
tools: Bash, Read, Glob, Grep
model: haiku
effort: low
---

Run `.claude/commands/commit-and-push.md` for the task id in your payload
(`{ "task": "TASK-NNN" }`).

**Before anything else**, confirm HEAD is on the task branch, not `main`
(`git rev-parse --abbrev-ref HEAD`). If it is on `main`/`master`, check out the
task branch for this id first (its name starts with the issue number, e.g.
`git checkout 117-task-054-...`). Never commit or push from `main` — that
bypasses the `pr-only` review gate. If no task branch exists, return
`{ "pushed": false, "error": "no task branch; HEAD on main" }`.

The Conventional Commit subject **must** end with ` (TASK-NNN)` for that id —
`scripts/next-task.sh` keys task done-ness on that exact parenthesised token.

Return **only** this JSON object, no prose, no code fences:

```json
{ "commit_subject": "type(scope): summary (TASK-NNN)", "pushed": true }
```
