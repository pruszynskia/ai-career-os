# Generate Next Milestone Command

Inspect completed work, the roadmap, and the backlog, and automatically
generate the next logical milestone's tasks — moving the product toward a
sellable, monetizable SaaS as efficiently as possible.

Input:

Optional stage/milestone name to target (e.g. `Stage 1`). If omitted,
determine the next stage automatically from `docs/ROADMAP.md`.

## Steps

### Step 1 - Load context

Read:

- CLAUDE.md
- AI_RULES.md
- ARCHITECTURE.md
- memory-bank/project-context.md
- memory-bank/decisions.md
- docs/ROADMAP.md
- docs/PRODUCT.md
- backlog/mvp.yaml
- docs/BACKLOG_MANAGEMENT.md

---

### Step 2 - Determine the next milestone

From `docs/ROADMAP.md`'s "Where We Are" section and `backlog/mvp.yaml`'s
`status` fields, find the first stage that is not yet fully represented in
the backlog (or the stage explicitly named in Input). Read that stage's item
list and goal from `docs/ROADMAP.md`.

Stage 0's own history is the precedent: `docs/ROADMAP.md`'s "Turning a Stage
Into Backlog Tasks" section notes that a stage's roadmap items are shorthand,
not literal task specs — items may merge, split, or get cut once grounded in
the real codebase at generation time. Re-verify every item against the actual
current code before drafting; don't transcribe roadmap titles as-is.

Before drafting a task for any bullet still showing `—`, apply
`docs/BACKLOG_MANAGEMENT.md` §2's duplicate check: grep `backlog/mvp.yaml`
for an existing task that already conceptually covers this bullet (a prior
`/add-tasks` run may have backlogged it under different wording without
updating the roadmap row). If found, just fix the roadmap row instead of
drafting a duplicate task.

---

### Step 3 - Apply the backlog-management process

Feed the resulting, codebase-grounded idea set through
`docs/BACKLOG_MANAGEMENT.md`'s process exactly as `/add-tasks` does (grouping,
expansion, milestone placement, logical insertion into both
`backlog/mvp.yaml` and `docs/ROADMAP.md`) — this step does not reimplement
that process, it reuses it. This includes the ID assignment safety note
(re-read `backlog/mvp.yaml` immediately before assigning the next
`TASK-XXX`) and the milestone-enum safety rule (§4) — do not skip either.

When multiple technically-valid task orderings exist within the milestone,
prefer whichever sequence reaches production readiness and the Monetization
Milestone (`docs/ROADMAP.md`) fastest, per `docs/BACKLOG_MANAGEMENT.md` §6.

---

### Step 4 - Verify

Run `docs/BACKLOG_MANAGEMENT.md`'s §8 verification checklist.

## Output

1. Which milestone was generated and why (including why it's the correct
   "next" one given current backlog status)
2. How the stage's roadmap items were grounded, grouped, and expanded into
   tasks, with reasoning
3. `backlog/mvp.yaml` diff (insertions only)
4. `docs/ROADMAP.md` diff
5. Verification checklist results
6. Any architectural concerns raised before applying changes
