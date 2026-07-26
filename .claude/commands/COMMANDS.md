# Claude Commands

Every slash command in this kit, grouped by category. Populated categories
list the real command; empty ones are a slot — add a `.md` file under
`claude/commands/` following the same `Input` / `Steps` / `Output` shape used
by the existing commands, then it becomes `/your-command-name` automatically.

## Planning

### `/add-tasks <ideas>`

File: `claude/commands/add-tasks.md`

Turns one or more rough ideas (a few words to a paragraph each, one
invocation may hold several) into fully-expanded `backlog/mvp.yaml` tasks,
following the shared methodology in `docs/BACKLOG_MANAGEMENT.md`: related
ideas are grouped into one coherent task, each task is expanded to the full
schema, and both `backlog/mvp.yaml` and `docs/ROADMAP.md` are updated with
the new task inserted at its true logical position — never appended to the
bottom, and never touching any existing task.

### `/generate-next-milestone [stage]`

File: `claude/commands/generate-next-milestone.md`

Inspects `docs/ROADMAP.md` and `backlog/mvp.yaml`'s current status to find
the next not-yet-backlogged stage, grounds that stage's roadmap shorthand in
the real codebase, then reuses `/add-tasks`'s underlying
`docs/BACKLOG_MANAGEMENT.md` process to turn it into inserted, expanded
tasks — biased toward whichever valid ordering reaches a sellable,
monetizable SaaS fastest.

## Implementation

### `/implement-task TASK-ID`

File: `claude/commands/implement-task.md`

Loads the task from `backlog/mvp.yaml` plus `CLAUDE.md`/`ARCHITECTURE.md`/
`docs/CODING_STANDARDS.md`, implements only that task's scope, runs
lint/test/build, and prepares a commit message. For tasks labeled `ui` or
touching `src/app`/`src/widgets`/a components directory, Step 4 also runs
the `docs/DESIGN_REVIEW_WORKFLOW.md` Playwright-MCP visual-QA loop.

## Review

### `/review-task TASK-ID`

File: `claude/commands/review-task.md`

Checks a task's changed files against architecture, language/framework
conventions, and typing rules; reports issues by severity with an approval
status.

### `/design-review ROUTE`

File: `claude/commands/design-review.md`

Loads `docs/design-system/*.md` and `docs/DESIGN_REVIEW_WORKFLOW.md`, then
runs one screen through the Playwright-MCP screenshot/compare/fix/verify
loop against the design system and named enterprise-SaaS benchmarks.

## Refactoring

Not yet defined. `fix-task` (below) covers targeted fixes; a broader
`/refactor` command would follow the same shape but take a file/module
instead of a TASK-ID.

## Debugging

### `/fix-task TASK-ID`

File: `claude/commands/fix-task.md`

Reads a prior review's findings, inspects related files, implements fixes,
re-runs lint/test/build, and summarizes what changed. Same conditional
`ui`-scope Playwright-MCP visual-QA sub-step as `/implement-task`.

## Version Control

### `/commit-and-push`

File: `claude/commands/commit-and-push.md`

Stages all changes (after a secrets/credentials sanity check), drafts a
Conventional Commit message from the actual diff following this repo's Git
Rules, commits, and pushes the current branch. Covers the "Commit" step in
CLAUDE.md's `TASK CREATED → Implementation → Review → Fix → Commit → Next
TASK` workflow.

## Deployment

Not yet defined. See `WORKFLOW.md` step 8 and `github/workflows/ci.yml` for
the current (manual-trigger) deployment path.

## Documentation

Not yet defined. `CLAUDE.md`'s "Documentation Rules" section already tells
Claude which doc to update after which kind of change — a command isn't
required for that to happen during `/implement-task`.

## Testing

Not yet defined. Folded into `/implement-task`'s validation step
(`npm run test`) and `/review-task`'s quality check.

## Architecture

Not yet defined. `ARCHITECTURE.md` and `docs/CODING_STANDARDS.md` are loaded
by both `/implement-task` and `/review-task`; a dedicated command would make
sense once you're doing standalone architecture reviews.

## Optimization

Not yet defined. See `docs/PERFORMANCE.md` for the standing rules
(`/review-task` already checks for performance problems).
