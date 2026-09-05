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
- **Stage 0** (`backlog/mvp.yaml` TASK-016–028): shipped.
- **Stage 1** (`backlog/mvp.yaml` TASK-032–048): shipped.
- **Stage 2** (`backlog/mvp.yaml` TASK-029–031, TASK-049–052): shipped.
- **Monetization Milestone** (`backlog/mvp.yaml` TASK-053–063): defined, not yet
  implemented.

Note: `status:` in `backlog/mvp.yaml` is stale and lags reality — most tasks
still read `todo` after shipping. Judge what is done from the code and git
history, not from that field.

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
| TASK-028 | Post management — status control, edit and delete (shipped) |

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

# Stage 1 — Product Refinement

`backlog/mvp.yaml` TASK-032–040, TASK-041–048.

**Goal:** remove everything that makes the product feel like an "unfinished
MVP." After this stage the product should look and feel professional.

| Task | Title |
|---|---|
| TASK-035 | Offer Details UX |
| TASK-044 | Offer Details — Expiration Date & Unblocked Track Application |
| TASK-045 | Offer — Delete Capability |
| TASK-036 | Toast Notifications |
| TASK-037 | Loading UX |
| TASK-046 | Sidebar — Sign-Out Action |
| TASK-038 | Document Editor & Persistent Documents |
| TASK-032 | CV Optimization Improvement Insights |
| TASK-047 | Dashboard & List Rows — Clickable Navigation and Hover |
| TASK-039 | Dashboard Improvements |
| TASK-033 | Profile Improvements — job preference settings |
| TASK-041 | Profile — Personal Projects from CV |
| TASK-042 | Profile — Automatic CV/Application Score |
| TASK-043 | Profile — Master Cover Letter Upload & Optimize |
| TASK-040 | Search Improvements |
| TASK-048 | Unify Offers and Applications into One View |
| TASK-034 | Enterprise UI/UX Audit & Redesign |

---

# Stage 2 — Core Value

`backlog/mvp.yaml` TASK-029–031, TASK-049–052.

**Goal:** add the features users would actually pay for.

| Task | Title |
|---|---|
| TASK-029 | AI-Generated LinkedIn Content Campaigns |
| TASK-030 | Offer & Application Expiration Detection |
| TASK-031 | Unified Notification Center |
| TASK-049 | Kanban Applications — board view of the offers page with drag-and-drop status changes |
| TASK-050 | Application Timeline — status-event history plus a recent-activity dashboard card |
| TASK-051 | Advanced Duplicate Detection — match signal, recency window and user resolution |
| TASK-052 | Recruiter Notes — free-text notes per application |

Row order matches the task blocks' order in `backlog/mvp.yaml`. The former
`—` rows collapsed into the four new tasks: "Drag & Drop" is TASK-049's
interaction rather than a separate feature, and "Recent Applications
Dashboard" is the dashboard view of TASK-050's status events.

---

# Monetization Milestone

`backlog/mvp.yaml` TASK-053–063.

After Stage 2, the user has a complete workflow: **start selling
subscriptions.** This is the point multi-user support and billing become
real, near-term requirements — not speculative ones. ADR-005/ADR-009's
`owner_id` + RLS + Supabase Auth groundwork exists specifically so this
milestone doesn't require a schema or auth rewrite.

**Goal:** go from a single seeded account to strangers signing up, paying, and
being served within a plan's limits — without touching the `owner_id` + RLS
model that already isolates their data.

| Task | Title |
|---|---|
| TASK-053 | Self-serve sign-up, email verification and password reset |
| TASK-054 | Google OAuth sign-in |
| TASK-055 | Public marketing landing and pricing pages |
| TASK-056 | Subscriptions schema, Stripe Checkout and webhook |
| TASK-057 | Billing portal and account settings page |
| TASK-058 | Plan model and entitlement gate |
| TASK-059 | Per-owner AI usage metering and free-tier quota |
| TASK-060 | New-user onboarding flow |
| TASK-061 | Error monitoring and environment variable validation |
| TASK-062 | Launch hardening — rate limiting, security headers, admin-client guard and account deletion |
| TASK-064 | Clear Supabase security and performance advisories |
| TASK-063 | Rotate development secrets before public launch |

Row order matches the task blocks' order in `backlog/mvp.yaml`, and follows
`docs/BACKLOG_MANAGEMENT.md` §6: accounts first (TASK-053/054), then the
storefront that names the tiers (TASK-055), then the billing core that charges
for them (TASK-056/057), then the gate and meter that make a plan mean something
(TASK-058/059), then activation (TASK-060) and the operational work that only
matters once strangers can sign up and pay (TASK-061/062).

TASK-055 carries a product decision, not just UI: the tier/price/allowance
definition it writes into `docs/PRODUCT.md` is what TASK-056's Stripe prices,
TASK-058's entitlement gate and TASK-059's quota all read. `docs/PRODUCT.md` has
no pricing model today, so that task is the one that creates it.

TASK-056 records **ADR-015** — the Stripe dependency, the `subscriptions` table,
and the single sanctioned use of the service-role client in a request path (a
signature-verified webhook has no session, so there is no `auth.uid()` for RLS to
match). TASK-062 then adds the lint rule that keeps that exception to exactly one
call site.

---

# Turning a Stage Into Backlog Tasks

Use `/generate-next-milestone` (`.claude/commands/generate-next-milestone.md`)
to do this automatically — it reads this file's target stage, grounds it in
the real codebase, and inserts the resulting tasks into `backlog/mvp.yaml`
and this file at their correct logical position via
`docs/BACKLOG_MANAGEMENT.md`'s process. For a handful of ad hoc ideas rather
than a whole stage, use `/add-tasks` instead.

When adding tasks by hand instead:

1. Read this file for the target stage's item titles and goal.
2. Follow the process in `CLAUDE.md`'s "Adding Tasks From a Roadmap" section
   and `docs/BACKLOG_MANAGEMENT.md` — new tasks get the next unused
   `TASK-XXX` ID but are inserted at their true logical position in both
   `backlog/mvp.yaml` and this file's stage table (not appended to the
   bottom), grounded in the actual codebase state *at that time*, with every
   acceptance criterion verified against real files.
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
- **Profile job preferences** (Stage 1 TASK-033) are collected but
  intentionally unused for matching or filtering in that task — they exist so
  a future job-discovery/matching feature can consume them additively later,
  without a schema change. (A LinkedIn-specific scraping/discovery feature
  was proposed and deliberately deferred — see `memory-bank/decisions.md` if
  an ADR is recorded, or ask before assuming scope for it.)
- **Monorepo/mobile** (Stage 0 TASK-027) — npm workspaces + Turborepo were
  evaluated and deferred (ADR-012 in `memory-bank/decisions.md`); see
  [docs/MONOREPO.md](MONOREPO.md) for the readiness criteria. The
  `apps/web` move stays deferred until a second app (a future React
  Native/Expo mobile client) actually starts being built. Until then, keep
  code that would eventually move into `packages/*` (design tokens, domain
  types, API-client shapes) easy to lift out of `src/shared` and
  `src/entities` rather than tightly coupled to Next.js-only APIs.

This complements `ARCHITECTURE.md`'s "Future Extensibility" section, which
covers the same intent at the architecture-rule level rather than the
roadmap/stage level.
