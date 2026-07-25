# Add Tasks Command

Turn one or more rough ideas into properly planned, fully-expanded tasks in
`backlog/mvp.yaml`, inserted at their true logical position — not appended
to the bottom.

Input:

One or more free-text ideas (a few words to a paragraph each; a single
invocation may contain several unrelated or related ideas).

Example:

```
/add-tasks improve dashboard, add Stripe, better notifications, company branding, onboarding
```

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

Do not draft any task before reading all of these — placement and expansion
decisions depend on the full current state of the backlog and roadmap.

---

### Step 2 - Apply the backlog-management process

Follow `docs/BACKLOG_MANAGEMENT.md` in full: analyze each idea, group related
ones into coherent tasks, expand each into the full `backlog/mvp.yaml` schema,
determine milestone placement, determine logical insertion position (driven
by dependencies and milestone order, never by submission order or current
implementation progress), and insert into both `backlog/mvp.yaml` and
`docs/ROADMAP.md` at matching positions.

If a proposed idea conflicts with Feature-Sliced Design, an existing shared
component/service, or a recorded ADR in `memory-bank/decisions.md`, stop and
explain the conflict instead of writing an inconsistent task — adapt the idea
to fit the existing architecture where a reasonable adaptation exists.

---

### Step 3 - Verify

Run `docs/BACKLOG_MANAGEMENT.md`'s §8 verification checklist (YAML parses, no
duplicate IDs, `depends_on` resolves, zero bytes of existing tasks touched,
roadmap/mvp.yaml position match, labels/milestones from the enum, acceptance
criteria grep-verified against real files).

## Output

1. Ideas received and how they were grouped, with reasoning
2. Milestone chosen for each resulting task, with reasoning
3. `backlog/mvp.yaml` diff (insertions only)
4. `docs/ROADMAP.md` diff
5. Verification checklist results
6. Any architectural concerns raised before applying changes
