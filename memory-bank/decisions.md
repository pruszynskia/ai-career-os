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
