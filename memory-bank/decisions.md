# Architecture Decisions

## ADR-001

Date:

2026-07-23

Decision:

Use a provider-agnostic AI service layer (`src/shared/ai/`) with separate
Anthropic and OpenAI adapters behind one `AiService` interface, instead of
calling one provider's SDK directly throughout the codebase.

Reason:

Every AI feature (CV parsing, CV optimization, offer extraction, match
scoring, tailored CV, recruiter message, LinkedIn posts) should be able to
switch providers without touching feature code.

Alternatives Considered:

- Single hard-coded provider (Anthropic only) — rejected: cheapest short-term but locks every feature to one vendor.

Consequences:

- Feature code depends only on the `AiService` interface, never a provider SDK directly.
- Slightly more upfront work (two adapters instead of one integration).

---

## ADR-002

Date:

2026-07-23

Decision:

LinkedIn posts are generated and scheduled in-app but published manually by
the user (copy-paste) — no LinkedIn API or OAuth integration in the MVP.

Reason:

Direct LinkedIn publishing requires LinkedIn OAuth and app approval, which is
disproportionate effort for a single-user tool. Generate-and-copy delivers
the same posting-consistency value without that integration cost.

Alternatives Considered:

- Direct LinkedIn API publishing — rejected: requires OAuth + LinkedIn app approval, out of proportion for MVP.

Consequences:

- No LinkedIn app review/approval dependency.
- The user must manually paste each post into LinkedIn; "sent" status is self-reported, not verified via API.

---

## ADR-003

Date:

2026-07-23

Decision:

Single-user authentication: one seeded account from environment variables,
gated via Auth.js credentials provider and middleware — no OAuth providers,
no users table, no registration.

Reason:

AI Career OS is a personal tool for one owner ("my profile", "my CV"), not a
multi-tenant SaaS. Full OAuth/multi-user auth would add data-isolation
complexity with no second user to serve.

Alternatives Considered:

- Full Auth.js with OAuth providers (Google/GitHub/Email) — rejected: multi-user complexity not needed for a single-user tool.

Consequences:

- Much smaller auth surface area to build and maintain.
- Revisiting this decision is required before this could ever become multi-user.

---

## ADR-004

Date:

2026-07-23

Decision:

The master profile is built by uploading an existing CV (PDF/DOCX), extracting
its text (`pdf-parse` / `mammoth`), and having AI structure it into a
`Profile` — rather than a manual structured-data entry form.

Reason:

The user already has a CV; parsing it is faster than re-entering the same
information into a form, and AI structuring handles varying CV formats
without a custom layout parser.

Alternatives Considered:

- Structured profile form (manual entry) — rejected: duplicates data the user already has in their CV.

Consequences:

- Parse quality depends on the AI step, not a deterministic parser — reviewed and editable by the user after upload.
- No OCR/image handling; CVs must be text-extractable PDF/DOCX.

---

## ADR-005

Date:

2026-07-23

Decision:

Even though MVP is single-user (ADR-003), design the schema and auth module
so multi-user support, full OAuth (Google, LinkedIn, GitHub, Email), and new
automations can be added later without a rewrite: top-level models get an
`ownerId` column from the first migration (defaulted to the seeded user), and
Auth.js is configured from day one so extra providers are additive config.

Reason:

The single-user/no-OAuth MVP scope (ADR-003) is a sequencing choice, not a
ceiling — the product may need multiple users and richer auth later. Adding
`ownerId` now costs nothing (it's a column with a single value) but avoids a
future data-migration; configuring Auth.js from day one avoids a future
framework swap.

Alternatives Considered:

- Add `ownerId` and OAuth providers only when a second user actually exists — rejected: retrofitting `ownerId` onto populated tables is a real migration, whereas including it from the first migration is free.

Consequences:

- TASK-002 (schema) and TASK-003 (auth) scope now includes this groundwork.
- MVP still ships with one seeded user and one credentials provider — no user-facing behavior changes.

---

## ADR-006

Date:

2026-07-23

Decision:

Backend is Next.js Route Handlers + Prisma + PostgreSQL, with a mandatory
layering: Route Handler → Zod validation → one entity service module
(`src/entities/{entity}/service.ts` or `src/features/{feature}/services/*.service.ts`)
→ Prisma Client singleton. Route handlers never call Prisma directly.

Reason:

A normal SaaS application needs a backend/data layer that stays maintainable
as features grow and stays easy for AI-assisted changes to locate: one
service module per entity means Prisma queries for that entity are never
duplicated or scattered, and a future change (multi-tenant scoping, caching,
audit logging) touches one file per entity instead of every route handler
that happens to query it.

Alternatives Considered:

- Call Prisma directly from route handlers — rejected: scatters an entity's data-access logic across every route that touches it, and duplicates query logic between endpoints and background jobs.
- Separate backend service (NestJS or similar) — rejected: unnecessary infrastructure for a single Next.js app; Route Handlers already serve as the backend.

Consequences:

- Every backend-touching task (TASK-002 onward) follows Route Handler → service → Prisma; scope for those tasks assumes this layering.
- Adding multi-tenant filtering (ADR-005) later means editing service modules, not auditing every route handler.

---

## ADR-007

Date:

2026-07-23

Decision:

Keep React Compiler enabled (`reactCompiler: true` in `next.config.ts`,
`babel-plugin-react-compiler` devDependency) as scaffolded by `create-next-app`
in TASK-001, overriding that task's own `do_not: introduce experimental
tooling`.

Reason:

Explicit user request during TASK-001 review. `npm run lint/typecheck/build`
all pass with it enabled.

Alternatives Considered:

- Strip it per the do_not rule — rejected: user explicitly wants it kept.

Consequences:

- Future reviews of TASK-001 (or any task touching `next.config.ts`) should
  not re-flag React Compiler as a violation — it's a deliberate exception,
  not an oversight.

## ADR-008

Date:

2026-07-24

Decision:

Update `ARCHITECTURE.md` and `docs/COMPONENT_GUIDE.md` to match the real,
shipped folder structure (`src/shared/ui`, singular feature-slice names)
instead of renaming code to match the docs, and make Feature-Sliced
dependency direction machine-enforced via `import/no-restricted-paths` in
`eslint.config.mjs` — including feature-to-feature isolation, with zones
generated from the actual `src/features/*` directory names so a new slice is
isolated automatically without editing the ESLint config again.

Reason:

Docs had drifted from the shipped code (`shared/components` vs. the real
`shared/ui`), and nothing prevented direct feature-to-feature imports:
`features/application` imported `getOfferOrThrow`/`OfferNotFoundError`/
`downloadTextFile` from `features/job-offer`, and
`features/job-offer/offer-detail.tsx` imported `features/application`'s
`useCreateApplication` hook — a live circular dependency. As the roadmap adds
many more feature slices, an unenforced rule would keep re-accumulating this
coupling.

Resolution of the application/job-offer coupling:

- `getOfferOrThrow` and `OfferNotFoundError` moved from
  `features/job-offer/services/get-offer.ts` into the entity layer
  (`entities/job-offer/service.ts`, next to `jobOfferService`), since offer
  lookup-or-throw is domain logic, not feature-specific.
- `downloadTextFile` (duplicated identically in `features/job-offer/utils.ts`
  and `features/cv/utils.ts`) consolidated into
  `shared/utils/download-text-file.ts`.
- `features/job-offer/components/offer-detail.tsx` no longer calls
  `useCreateApplication` itself; it accepts the mutation state as props
  (`onTrackApplication`, `isTrackingApplication`, `trackApplicationError`).
  A new `widgets/offer-detail-panel/offer-detail-panel.tsx` composes
  `OfferDetail` with the `application` feature's hook (widget → feature is an
  allowed direction) and is what the offer detail page now renders.

Alternatives Considered:

- `eslint-plugin-boundaries` — rejected: `import/no-restricted-paths` from
  `eslint-plugin-import` does the same job and needed zero new dependencies
  (`eslint-plugin-import` is already present transitively via
  `eslint-config-next`, with its TypeScript path resolver already configured).
- Renaming `entities/job-offer/service.ts` exports or introducing a
  `job-offer` "public API" barrel — rejected: unnecessary indirection for
  three functions; the entity module is already the single file per entity
  that owns its Prisma access.

Consequences:

- Any future direct import between two `src/features/*` slices, or from
  `shared`/`entities` up into `features`/`widgets`/`app`, now fails
  `npm run lint`.
- Cross-feature composition must go through the widget layer, matching
  `ARCHITECTURE.md`'s existing widget → feature dependency rule.

## ADR-009

Date:

2026-07-24

Decision:

Migrate the backend from Prisma + PostgreSQL + Auth.js to Supabase: Supabase
PostgreSQL accessed directly via `@supabase/supabase-js` (no ORM), with
per-owner authorization enforced by Row Level Security (`owner_id =
auth.uid()`) instead of app-level `ownerId` filtering, and Supabase Auth
(single seeded email/password user via `scripts/create-owner-user.ts`,
session handled by `@supabase/ssr`) replacing Auth.js. This supersedes
ADR-006's Prisma/PostgreSQL layering and amends ADR-005's mechanism (the
`ownerId` column becomes `owner_id uuid references auth.users`, and "Auth.js
configured for additive OAuth providers" becomes "Supabase Auth, OAuth
providers are a dashboard toggle"). ADR-003's decision — one seeded owner
account, no registration, no multi-user — is unchanged; only its mechanism
is.

Reason:

Supabase provides Postgres, auth, and (when needed) storage as one platform
with Vercel-friendly deployment, removing a separate ORM/connection layer and
an Auth.js credentials setup that had to be hand-rolled for a "single user"
model Auth.js isn't really built around. RLS enforces owner scoping at the
database level, which is a stronger guarantee than the app-level scoping
helper ADR-005/TASK-021 had planned, and needs no additional code per entity.

Alternatives Considered:

- Keep Prisma, point `DATABASE_URL` at Supabase's Postgres connection string — rejected: still requires Prisma's client/migration workflow on top of a platform (Supabase) that already provides equivalent tooling (SQL migrations, generated types); doesn't get RLS-based authorization without extra app-level plumbing anyway.
- Keep Auth.js, add a Supabase Postgres-backed adapter — rejected: Auth.js's credentials-only single-user setup and Supabase Auth's session/user model would have run in parallel, doubling the auth surface instead of replacing it.

Consequences:

- `prisma/`, `@prisma/client`, `prisma`, and `next-auth` are removed entirely; `@supabase/supabase-js` and `@supabase/ssr` are the only backend dependencies.
- Every entity service (`src/entities/*/service.ts`) now calls the Supabase query builder directly with plain-argument methods (no Prisma-shaped `{where, data}` objects), mapping snake_case rows to the same camelCase domain shapes callers already expected.
- `src/shared/auth/owner.ts` (the `SEED_OWNER_ID` constant) is replaced by `src/shared/auth/session.ts`'s `getOwnerId()`, which reads the real signed-in Supabase Auth user's id per request.
- Canonical domain types (`Profile`, `CvDocument`, `JobOffer`, `Application`, `ApplicationStatus`, `ApplicationBundle`, `Post`) now live under `src/entities/*/types.ts` instead of being imported from `@prisma/client` — this also closes the gap TASK-024 had flagged (no `cv-document/types.ts`, ad hoc DTOs).
- TASK-021's planned "shared ownerId scoping helper" is superseded by RLS; no such helper was built.

## ADR-010

Date:

2026-07-25

Decision:

Replace shadcn's default zinc/blue starter palette with a Deep Navy /
Electric Blue / Emerald enterprise identity, applied as OKLCH values on the
existing shadcn semantic token names in `src/app/globals.css` (`--primary`,
`--accent`, `--secondary`, `--muted`, `--border`, `--ring`, and a new
`--success` token), and documented under `docs/design-system/` (`colors.md`,
`typography.md`, `ui-principles.md`) as the single source of truth for
future screens.

Reason:

The app conveys Trust (Deep Navy), Intelligence (Electric Blue), and
Progress (Emerald) as its brand attributes; the shadcn starter palette
carries no such identity. Reusing the existing token names (rather than a
parallel theming layer) keeps every current and future `shared/ui`
component, feature, and widget on the same system with zero component code
changes.

Alternatives Considered:

- A separate design-tokens package/theming abstraction on top of shadcn's
  tokens — rejected: no second consumer exists yet, and it would duplicate
  the token names shadcn/Tailwind already resolve through `@theme inline`.
- Leaving the destructive/error hue in the same brand-navy family — rejected:
  red carries the correct semantic meaning for errors independent of brand
  color; only its contrast pairing was re-verified, not its hue.

Consequences:

- `src/app/globals.css` is the only source of color values; no component
  hardcodes an OKLCH/hex color.
- `docs/design-system/*.md` is required reading before any new screen adds
  color or typography (referenced from `ARCHITECTURE.md`'s Design System
  section) — TASK-019/020 layout work builds on top of these tokens rather
  than picking new colors.
- `bg-success` / `text-success-foreground` become available Tailwind
  utilities alongside the existing `bg-destructive` pattern.

## ADR-011

Date:

2026-07-25

Decision:

Document, as an amendment to ADR-001, that `src/shared/ai/` ships a third
adapter (`src/shared/ai/adapters/gemini.ts`) alongside Anthropic and OpenAI,
selected via the `AI_PROVIDER` environment variable (`anthropic` | `openai`
| `gemini`, default `anthropic` — see `src/shared/ai/service.ts`'s
`getAiService()`). Each provider requires its own API key env var
(`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY`); `getAiService()`
throws at call time if the key for the selected provider is missing. This
ADR also records that per-route AI error handling (rate-limit detection and
the generic-error fallback) is now consolidated in
`src/shared/ai/errors.ts`'s `toAiErrorResponse(error, fallbackMessage)`,
replacing the copy-pasted `isRateLimitError` branch previously duplicated in
every AI route handler.

Reason:

The Gemini adapter was added after ADR-001 was written but never
documented, leaving `AI_PROVIDER`'s valid values and required env vars
undiscoverable outside the source. Separately, 9 AI route handlers had each
reimplemented the same rate-limit-then-generic-500 error branch with
inconsistent results (`cv/optimize`'s `NoMasterCvError` mapped to 400 while
every other route mapped the same error class to 422); consolidating into
one helper fixes that drift and gives every AI route the same response
shape for the same error class.

Alternatives Considered:

- Editing ADR-001's body in place to add Gemini — rejected: inconsistent
  with this file's existing convention of additive, dated ADRs that amend
  rather than rewrite prior decisions (e.g. ADR-009 superseding ADR-006).
- A generic `[ErrorClass, status][]` table passed into the shared helper so
  routes need zero domain-error branches — rejected: each route only has
  1-2 domain-error checks; a lookup-table abstraction is unwarranted for
  that size and adds indirection over just calling
  `toAiErrorResponse(error, fallbackMessage)` after the route's own
  `instanceof` checks.

Consequences:

- `isRateLimitError` moved from `src/shared/ai/service.ts` to
  `src/shared/ai/errors.ts`; `service.ts` now only exports `getAiService()`.
- Every AI-backed route handler imports `toAiErrorResponse` from
  `@/shared/ai/errors` and calls it as the final catch-all after its own
  domain-error `instanceof` checks.
- No behavior change to provider selection itself — this ADR is
  documentation plus an error-response bug fix, not a new capability.

## ADR-012

Date:

2026-07-25

Decision:

Defer adding npm workspaces + Turborepo (`turbo.json`, `package.json`
`"workspaces"`, `packages/*`). Audited the repo first: no `turbo.json`, no
`pnpm-workspace.yaml`, no `yarn` workspaces, no `"workspaces"` field in
`package.json`, and no `packages/` or `apps/` directory exist today — the
repo is a single Next.js app with `src/` at the root. No monorepo tooling
is scaffolded by this ADR; readiness criteria for revisiting are recorded
in `docs/MONOREPO.md`.

Reason:

There is no second app or package consuming shared code yet, so npm
workspaces + Turborepo would be infrastructure with nothing to serve.
Scaffolding `packages/typescript-config` and `packages/eslint-config` now
would be exactly the kind of empty-placeholder package this task's own
`do_not` list forbids, and runs against the project's stated
avoid-premature-abstraction convention (`CLAUDE.md`). `docs/ROADMAP.md`'s
Forward-Compatibility Notes already anticipated this: the monorepo move is
tied to a second app (mobile) actually starting, which hasn't happened.

Alternatives Considered:

- Scaffold `packages/typescript-config` + `packages/eslint-config` now,
  ahead of any real consumer — rejected: no code would import from them,
  making them dead weight that has to be kept in sync with the root config
  for no benefit until a second app/package exists.
- Move `src/` into `apps/web` now, ahead of a second app — rejected:
  explicitly disallowed by this task; would invalidate every existing
  backlog task's `scope:` file paths for no immediate benefit.
- Add Turborepo without npm workspaces, just to get task-graph caching for
  the single existing app — rejected: `npm run build`/`lint`/`typecheck`
  already run in seconds on this single-package repo; Turborepo's caching
  and parallelization only pay off once there's more than one
  package/app to orchestrate.

Consequences:

- No `turbo.json`, no `"workspaces"` field, no `packages/*` exist after this
  ADR — root `package.json` scripts (`dev`, `build`, `lint`, `typecheck`,
  `test`, `format`) are unchanged.
- `docs/MONOREPO.md` records the concrete trigger for revisiting (a second
  app — e.g. a React Native/Expo mobile client — actually starting, or a
  second package gaining a real consumer) and what would be scaffolded at
  that point.
- Every existing backlog task's `scope:` paths under `src/` remain valid —
  nothing moved.

## ADR-013

Date:

2026-08-26

Decision:

Add a `cv_documents.kind` enum column (`MASTER | OPTIMIZED | TAILORED |
COVER_LETTER`, migration `20260826090000_cv_document_kind.sql`) and make
cover-letter generation persist a `CvDocument` row via `createVersion`
(previously it returned ephemeral AI output with no row at all). Place the
new editable-document UI (`DocumentEditor`, textarea + Save + Download) and
its `updateDocument` fetch call in `src/shared` rather than in the `cv` or
`job-offer` feature that first needed it.

Reason:

TASK-038 needed a documents list badging each row Master/Optimized/Tailored/
Cover Letter. `isMaster`/`jobOfferId` can't express that: tailored CVs and
cover letters are both `isMaster:false` with `jobOfferId` set, so nothing
distinguished them — `kind` makes the distinction explicit and queryable
(e.g. `findWithLatestTailoredCv` now filters `kind = 'TAILORED'` so a
later-generated cover letter can't be picked up as the CV sent with an
application). Persisting the cover letter was required for it to be
editable/saveable at all — editing needs a row `id` to update in place.
`DocumentEditor` is needed identically by `optimize-cv-panel.tsx` (`cv`
feature) and `offer-detail.tsx` (`job-offer` feature); `ARCHITECTURE.md`
forbids feature→feature imports, so `shared` — importable by both — is the
only layer that keeps a single implementation instead of one per feature.

Alternatives Considered:

- Infer the badge from `isMaster`/`jobOfferId` only, without a schema
  change — rejected: cannot express "tailored CV" vs. "cover letter" with
  those two columns; would either mislabel one of them or make the
  documents list wrong for every job offer with both generated.
- Duplicate the editable-textarea+Save component into `cv/components` and
  `job-offer/components` instead of a shared component — rejected: same
  fetch/mutation/toast logic maintained in two places for one behavior with
  no per-feature variation.
- Add a `kind` "feature" slice for cross-feature composition (per
  `ARCHITECTURE.md`'s widget-layer pattern for offer-detail→application)
  — rejected: `DocumentEditor` isn't composing two features' business logic
  the way `offer-detail-panel` does, it's one reusable piece of UI+fetch
  around a single entity; a widget would be the wrong layer for something
  with no feature-specific behavior to compose.

Consequences:

- `cvDocumentService.create`/`createVersion` now require `kind` — every
  existing caller (`upload-cv`, `optimize-cv`, `tailor-cv`,
  `cover-letter`) was updated to pass it explicitly; a new caller that
  forgets it fails to typecheck rather than silently mislabeling a document.
- `kind:'MASTER'` marks what a document originally was, not whether it's
  still the current master — after a second CV upload, the previous
  master's `is_master` flips to `false` but `kind` stays `MASTER`;
  `document-list.tsx` labels that case "Master (previous)" to avoid two
  identical "Master" badges with no way to tell which is active.
- `CoverLetterResponse` changed from `{ content }` to `{ cvDocument }` —
  every consumer (`offer-detail.tsx`, the cover-letter route handler)
  updated in the same change.

---

## ADR-014

Date:

2026-08-28

Decision:

`application_status_events` (TASK-050, migration
`20260828120000_application_status_events.sql`) is an append-only event log
and carries `id, owner_id, application_id, status, created_at` — **no
`updated_at`**, deviating from `ARCHITECTURE.md`'s "every table carries
`id`, `owner_id`, `created_at`, `updated_at`". Rows are never updated or
deleted in place (only via the `applications` cascade). History writes in
`create-application.service.ts` and `update-status.service.ts` are
best-effort (`.catch` + `console.error`), not part of the transaction that
writes `applications.status`.

Reason:

An `updated_at` on an immutable row is dead weight and misleading — it would
always equal `created_at`. The status column on `applications` stays the
source of truth for current state; this table is additive history only.
Making the event write fail the request would turn a committed
`createApplication` (which has no duplicate guard) into a 500 whose retry
creates a second application — the history is strictly secondary to the
write it records.

Alternatives Considered:

- Add `updated_at` anyway for schema uniformity — rejected: a column that
  can never legitimately change invites code that tries to change it.
- Wrap both writes in a Postgres RPC for atomicity — deferred: worth doing
  only if history ever has to be transactional; a single-writer app does
  not need it now (same call recorded in `delete-offer.service.ts`).

Consequences:

- A new table without `updated_at`; any generic "touch `updated_at`" helper
  added later must not assume it exists on every table.
- A dropped event on a transient DB error leaves a gap in the timeline but
  never blocks the user; `applications.status` remains correct.
- `applicationService.existsForOffer` was removed — `findByOffer(...)  !==
  null` covers its one caller (`delete-offer.service.ts`).

---

## ADR-016

Date:

2026-09-04

Decision:

The autonomous deployment loop (`/loop /deploy-cycle`,
`.claude/commands/deploy-cycle.md`) runs the full per-task cycle unattended:
implement → independent review → fix → commit → open PR → wait for CI + the
Vercel build → merge → sync `main` → verify the production deploy → pick the
next task. Two decisions are load-bearing:

1. **Production stays auto-deployed on merge.** Vercel's staged-production
   toggle (disable *Auto-assign Custom Production Domains*, promote explicitly)
   was proposed so the human gate could move from merge to promote. Declined —
   a merged PR goes live immediately.
2. **Autonomy is a config level in `.claude/deploy-loop-state.json`**:
   `pr-only` (loop stops with the PR open, Andrzej merges) → `auto-merge`
   (`scripts/merge-gate.sh` then `gh pr merge --auto`). Ships at `pr-only`.

The merge gate and every hard cap are deterministic and live outside the
prompt: `scripts/merge-gate.sh` (checks green, path guard on `package.json` /
lockfile / `supabase/migrations/**` / `.github/workflows/**` / `vercel.json` /
`.env*` / `src/proxy.ts` / `src/shared/auth/**`, ≤15 files / ≤400 lines,
`review_verdict == Approved` and `fix_round <= 1`, not behind `origin/main`),
state-file budgets (`max_ticks_per_task` 20, `max_tasks_per_run` 5,
`consecutive_failures` 3, wall-clock `deadline`), and GitHub branch protection
requiring the `build` check. The reviewer (`deploy-review`) is a different
model (Opus) on a fresh context seeing only the diff + the task spec.

Reason:

Merge to `main` here is reversible (revert PR); production exposure is not, and
the Hobby plan's Instant Rollback only reaches the immediately previous
deployment. Research (`memory-bank/deploy-loop-research.md`, F1–F11) is
consistent: LLM self-review misses ~1/3 of semantic drift and self-bias
amplifies under iterative refinement, so the review verdict is necessary but
not sufficient — deterministic checks and platform-enforced required checks
carry the gate. Runaway agent loops are a documented five-figure failure mode,
hence the layered caps. Going attended → unattended gradually is the unanimous
practitioner recommendation, hence `pr-only` as the shipped default.

Alternatives Considered:

- Staged production with a promote gate — declined by Andrzej; recorded because
  it changes the risk profile (live-on-merge). Revisit if a bad deploy ever
  reaches users.
- Keep the merge gate in the orchestrator prompt — rejected: hard limits must
  be in the control plane, not model judgment (F3). A bug in our own logic must
  not be able to merge a red PR; branch protection guarantees that.
- Single implementer-reviews-own-diff — rejected (F1). Opus-reviews-Sonnet on a
  fresh context is a safety property, not a cost choice.
- One combined `next-task` state field from `backlog/mvp.yaml` `status:` —
  rejected: that field is stale. Done-ness is read from `origin/main` commit
  subjects (`(TASK-NNN)`).

Consequences:

- New: `scripts/{next-task,merge-gate,start-task}.sh` (+ `.test.sh` self-checks),
  `scripts/lib/issue-body.sh` (extracted from `sync-backlog.sh`, which now
  sources it), `.claude/agents/deploy-{orchestrator,impl,review,fix,commit}.md`,
  `.claude/commands/deploy-cycle.md`.
- Runtime state in `.claude/deploy-loop-{state.json,ledger.jsonl}` (git-ignored);
  git + `gh` remain the truth for what's merged.
- One-time setup outside the loop: `gh auth refresh -s project,read:project`
  and branch protection on `main` requiring `build`.
- `start-task.sh`'s backlog commit subject deliberately omits `(TASK-NNN)` so
  `next-task.sh` does not read it as the task being done.
