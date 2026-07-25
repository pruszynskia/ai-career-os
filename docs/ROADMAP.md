# Product Roadmap

This is the staged execution plan for AI Career OS beyond the initial MVP.
It exists so architectural and design decisions made while implementing any
single task stay compatible with what's coming, without pulling future work
forward. It is loaded on every task per CLAUDE.md's Context Loading Order.

For the day-to-day product vision, user problems, and MVP scope, see
`docs/PRODUCT.md`. This file is the longer-horizon staged plan; `PRODUCT.md`'s
own "Future Roadmap" (Phase 2/3) section is a subset of the ideas staged here.

---

# Ultimate Goal

AI Career OS starts as a single-user tool (see `docs/PRODUCT.md`), but is
architected from day one so it can become a sellable multi-user product
without a rewrite (ADR-005/ADR-009: `owner_id` on every table enforced by
Row Level Security, Supabase Auth ready for additive OAuth providers). The
roadmap below is the path from "working prototype" to "product people would
pay for."

---

# Where We Are

- **MVP** (`backlog/mvp.yaml` TASK-001–015): shipped. Core loop — CV
  upload/parse/optimize, offer ingestion, match/tailor-CV/recruiter-message,
  application tracking, LinkedIn post generation/scheduling, dashboard,
  CI/deploy.
- **Stage 0** (`backlog/mvp.yaml` TASK-016–027): defined, not yet
  implemented.

---

# Stage 0 — MVP Stabilization

`backlog/mvp.yaml` TASK-016–027.

**Goal:** stop developing a "prototype", start developing a "product." In
~6 months the app will likely have 200+ components; unorganized foundations
get exponentially more expensive to fix the longer they're left.

| Task | Title |
|---|---|
| TASK-016 | Architecture normalization & Feature-Sliced Architecture enforcement |
| TASK-017 | Shared Design System — enterprise color, typography, UI principles |
| TASK-018 | Playwright visual-QA & Claude Code UI-engineer workflow‡ |
| TASK-026 | UI primitives layer (layout, typography, surface, interaction)† |
| TASK-019 | Reusable components library |
| TASK-020 | Shared layouts |
| TASK-021 | Data layer / repository pattern |
| TASK-022 | AI services layer hardening |
| TASK-023 | Document module refactor |
| TASK-024 | Domain models |
| TASK-025 | Application state refactor |
| TASK-027 | Evaluate and introduce Turborepo workspace structure |

† Added after TASK-025 existed, so it kept the next free ID (026) per
`CLAUDE.md`'s append-only numbering rule, but its `depends_on` (TASK-004,
TASK-016, TASK-017) and TASK-019/TASK-020's `depends_on` (both now include
TASK-026) place it here in execution order: it builds `src/shared/ui/primitives`
(Box, Stack, Grid, Text, Heading, Badge, Avatar, etc.) as the low-level
foundation that TASK-019's composite components and TASK-020's page shells
compose, instead of hand-written Tailwind. It lives inside the existing
Feature-Sliced `src/shared/ui` layer, not a separate top-level `src/ui/` tree.

TASK-027 is audit-gated: it decides — and records as an ADR — whether npm
workspaces + Turborepo (`packages/*`) are worth adding now, for future
shared packages and a possible mobile app. If adopted, it stays a sibling of
the existing root-level `src/`; the app is **not** moved into `apps/web` by
this task. See the Forward-Compatibility Notes below for the mobile trigger
condition.

‡ TASK-018's scope was extended beyond the standalone `/design-review`
command: `/implement-task` and `/fix-task` (`.claude/commands/*.md`) now
also gain a conditional Step 4 sub-step that runs the same
`docs/DESIGN_REVIEW_WORKFLOW.md` Playwright-MCP loop against a task's
changed routes before marking it done — but only when the task is labeled
`ui` or its scope touches `src/app`, `src/widgets`, or a components
directory. Non-UI tasks (backend, database, AI-service-only) never trigger
it, so routine implementation work doesn't pay for a browser-driving visual
check it doesn't need.

---

# Stage 1 — Product Refinement (not yet in backlog/mvp.yaml)

**Goal:** remove everything that makes the product feel like an "unfinished
MVP." After this stage the product should look and feel professional.

- Offer Details UX
- Toast Notifications
- Loading UX
- Document Editor
- Persistent Documents
- Dashboard Improvements
- Profile Improvements
- Search Improvements

---

# Stage 2 — Core Value (not yet in backlog/mvp.yaml)

**Goal:** add the features users would actually pay for.

- Kanban Applications
- Drag & Drop
- Application Timeline
- Offer Expiration Detection
- Automatic Expired Status
- Advanced Duplicate Detection
- Recruiter Notes
- Recent Applications Dashboard

---

# Monetization Milestone

After Stage 2, the user has a complete workflow: **start selling
subscriptions.** This is the point multi-user support and billing become
real, near-term requirements — not speculative ones. ADR-005/ADR-009's
`owner_id` + RLS + Supabase Auth groundwork exists specifically so this
milestone doesn't require a schema or auth rewrite.

---

# Turning a Stage Into Backlog Tasks

When asked to add the next set of tasks from this roadmap:

1. Read this file for the target stage's item titles and goal.
2. Follow the process in `CLAUDE.md`'s "Adding Tasks From a Roadmap" section
   — append after the last real `TASK-XXX` in `backlog/mvp.yaml`, ground each
   task in the actual codebase state *at that time*, verify every acceptance
   criterion against real files.
3. Titles below are the roadmap's shorthand, not a literal task spec — Stage
   0's items were merged, renamed, and re-scoped based on the real codebase
   when they were turned into TASK-016–025 (see those tasks and their ADRs
   for the actual result). Expect the same treatment for Stage 1/2: some
   items may merge, split, or get cut if the codebase has already solved
   them by the time you get there.

---

# Forward-Compatibility Notes

Keep these in mind even while working on an earlier-stage task — not to
build the future work now, but to avoid choices that would need to be undone
when it arrives:

- **Document handling** (Stage 0 TASK-023) should stay friendly to Stage 1's
  "Document Editor" and "Persistent Documents" — don't design a one-shot
  generate-and-discard flow for CV/document content.
- **Application status/pipeline** work should stay friendly to Stage 2's
  Kanban + Drag & Drop + Timeline — keep status transitions as data the UI
  reads, not view-only/derived state.
- **JobOffer model/ingestion** should leave room for Stage 2's "Offer
  Expiration Detection" / "Automatic Expired Status" — don't bake in an
  assumption that offers never expire.
- **Duplicate detection** (already shipped, TASK-010) should stay swappable
  for Stage 2's "Advanced Duplicate Detection" without a rewrite of the
  ingestion pipeline.
- **Auth/ownership** (ADR-005) already anticipates the subscriptions
  milestone — don't add anything that would need to be undone when
  multi-user/billing lands.
- **Monorepo/mobile** (Stage 0 TASK-027) — the `apps/web` move stays
  deferred until a second app (a future React Native/Expo mobile client)
  actually starts being built. Until then, keep code that would eventually
  move into `packages/*` (design tokens, domain types, API-client shapes)
  easy to lift out of `src/shared` and `src/entities` rather than tightly
  coupled to Next.js-only APIs.

This complements `ARCHITECTURE.md`'s "Future Extensibility" section, which
covers the same intent at the architecture-rule level rather than the
roadmap/stage level.
