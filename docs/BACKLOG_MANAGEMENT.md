# Backlog Management

The methodology `/add-tasks` and `/generate-next-milestone`
(`.claude/commands/add-tasks.md`, `.claude/commands/generate-next-milestone.md`)
both follow when turning ideas into `backlog/mvp.yaml` tasks. Neither command
file repeats this process — they delegate to it, the same way `/implement-task`
and `/fix-task` both delegate their visual-QA sub-step to
`docs/DESIGN_REVIEW_WORKFLOW.md`.

## Why this exists

Turning ideas into tasks by hand tends to produce one task per bullet point
and appends everything to the end of `backlog/mvp.yaml`, regardless of where
it actually belongs. `docs/ROADMAP.md`'s Stage 0 table shows the result: TASK-026
belongs between TASK-018 and TASK-019 by dependency, but was appended at the
end with that ID and needs a footnote (`†`) to explain the mismatch. This
process replaces that append-and-footnote pattern with true logical insertion,
while preserving the two invariants that made the old process safe:

- Existing tasks are never renumbered, edited, or deleted.
- New tasks always get the next unused monotonic `TASK-XXX` ID.

What changes: a new task's **position** in the file (and in the matching
roadmap table) is no longer forced to the end — it's inserted between
whichever existing, untouched tasks it logically belongs between. ID order and
file position can now differ for new tasks; that's expected and fine, since
dependency resolution (`depends_on`) is by ID, not by position.

## 1. Analyze every idea

For each idea, determine:

- **Scope** — what it actually requires to ship.
- **Dependencies** — what existing code/tasks it needs (grep the real
  codebase, don't assume).
- **Architectural impact** — which Feature-Sliced layer(s) it touches
  (`src/app`, `src/features`, `src/entities`, `src/shared`, `src/widgets` —
  see `ARCHITECTURE.md`).
- **Relation to existing tasks** — does it overlap with, extend, or duplicate
  a task already in `backlog/mvp.yaml` (done or todo)?
- **Milestone fit** — see §3.

## 2. Group related ideas

Group ideas that share one implementation scope — same feature area, same
architectural layer, one coherently deployable unit — into a single task.
Keep genuinely independent ideas as separate tasks.

Example: "add Stripe," "billing portal," "subscription plans," and "trial
management" are one task (`Subscription Management`), not four. "Improve
dashboard" and "company branding" are unrelated and stay separate.

The goal is tasks that represent meaningful development units, not a
mechanical one-task-per-sentence split. When in doubt, prefer fewer, more
complete tasks over many thin ones — matching this project's
avoid-premature-abstraction, avoid-unnecessary-splitting conventions
(`CLAUDE.md` Coding Philosophy).

## 3. Expand into a full task spec

The user's note is inspiration, not the task. Every generated task must be
implementation-ready for a future Claude session that has no other context,
using the exact schema `CLAUDE.md`'s "Adding Tasks From a Roadmap" section
already defines — `id`, `github: {issue: null, project_item: null}`,
`status: todo`, `priority`, `estimate`, `milestone`, `depends_on`, `title`,
`goal: >`, `scope`, `deliverables`, `tasks`, `acceptance`, `done`, `labels`
(only from the `project.labels` enum in `backlog/mvp.yaml`'s header —
never invent one), `context`, `references`, `prompt: |`, `do_not`. That
section's field-by-field rules (schema style, grounding in the real codebase,
`depends_on` reflecting real technical prerequisites, self-review pass for
speculative/unverified content) apply in full — this file only adds the
grouping and placement rules layered on top.

## 4. Determine milestone placement

Match each task against `docs/ROADMAP.md`'s staged plan: Stage 0 → Stage 1 →
Stage 2 → Monetization Milestone (see that file's "Where We Are" and
per-stage sections).

- If the task fits an existing, already-in-backlog stage, use that
  `milestone` value from `project.milestones` in `backlog/mvp.yaml`.
- If it's the **first** task landing in a stage not yet represented in
  `project.milestones` (e.g. Stage 1, Stage 2, or Monetization), extend that
  enum with the real stage name from `docs/ROADMAP.md` — never an invented
  label — and update `docs/ROADMAP.md`'s "Where We Are" section to drop the
  "(not yet in backlog/mvp.yaml)" annotation for that stage.
- Never split or merge an existing milestone as a side effect of adding one
  task; that's a separate, explicit decision if it's ever actually needed.

## 5. Determine logical placement (not submission order, not progress)

Position is driven by:

1. The dependency graph (`depends_on`) — a task is placed after everything it
   depends on and before anything that depends on it.
2. Milestone/stage order — Stage 0 tasks precede Stage 1 tasks, etc.
3. Within a stage, the order that best serves `docs/ROADMAP.md`'s Ultimate
   Goal and Monetization Milestone — see §6.

Placement is **never** driven by:

- The order ideas were submitted in.
- Which tasks happen to already be in progress or partially built. Two future
  tasks are sometimes developed together because they depend on each other —
  that implementation reality must not change their logical position. Always
  place tasks according to the intended architecture, not the current
  implementation snapshot.

## 6. Optimize for reaching a sellable SaaS product

When more than one valid ordering exists, prefer whichever gets to a
monetizable product fastest without sacrificing maintainability: production
readiness, auth, payments/subscriptions/billing, onboarding, and the other
milestones already named in `docs/ROADMAP.md`'s "Monetization Milestone"
section. This is a tiebreaker among technically-valid orderings, not a
license to skip real dependencies.

## 7. Insert into both files at the same position

- **`backlog/mvp.yaml`**: insert the new task's YAML list item(s) between the
  correct pair of existing task blocks (or at the end, if that's genuinely
  where it belongs) — never touching a single line of any existing task.
  Comment-banner style (`# TASK-0XX #############`) matches existing tasks.
- **`docs/ROADMAP.md`**: insert a matching row in the same relative position
  in the target stage's table. Keep it concise —
  `| TASK-ID | Title — one-line objective |`, extending the existing
  two-column format inline rather than adding a new column or a paragraph.
  Full detail lives only in `mvp.yaml`; the roadmap is for planning, not
  implementation spec.

If a task doesn't cleanly fit an existing stage table (e.g. it's the first
task of a newly-activated milestone), add that milestone's `#` heading/table
in the position `docs/ROADMAP.md` already implies (Stage 0, then Stage 1,
then Stage 2, then Monetization), converting its "(not yet in backlog/mvp.yaml)"
section header into the real, populated one.

## 8. Verify before reporting done

- `backlog/mvp.yaml` parses as YAML.
- No duplicate `id`s.
- Every `depends_on` reference resolves to a real task ID.
- The diff touches zero bytes of any pre-existing task block (pure insertion).
- The new row's position in `docs/ROADMAP.md`'s table matches the new task
  block's position in `backlog/mvp.yaml` relative to the same neighboring
  tasks.
- `labels` and `milestone` values are all from the `project.labels` /
  `project.milestones` enums.
- Acceptance criteria reference real files/APIs — grep-verify, don't assume.

## Report shape

Both commands report, per run: the ideas received, how they were grouped and
why, the milestone chosen for each resulting task and why, the files changed,
and the result of the §8 verification checklist. Flag any architectural
conflict (something that would require breaking Feature-Sliced Design,
duplicating an existing service/component, or contradicting an existing ADR
in `memory-bank/decisions.md`) before applying changes, per `CLAUDE.md`'s
"If task requirements conflict with project architecture: Stop and explain
the conflict."
