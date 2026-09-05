# Application Architecture

## Architecture Pattern

Feature Slice Architecture

## Folder Structure

src

app

- routing
- layouts
- providers

features

- business functionality

entities

- domain models

shared

- reusable infrastructure

widgets

- complex reusable UI blocks

Example:

features/`<feature-name>`/

components/
hooks/
services/
types.ts
utils.ts

---

# Data Flow

UI Component

↓

React Query

↓

API Layer

↓

Backend

Client state:

Zustand

Server state:

React Query

---

# State Rules

Server data:

React Query

UI state:

Zustand

Forms:

React Hook Form + Zod

---

# Component Hierarchy

Page

↓

Widget

↓

Feature Component

↓

Shared Component

---

# Dependency Rules

Allowed:

feature → shared

feature → entity

widget → feature

widget → shared

widget → entity

Forbidden:

shared → feature

entity → feature

feature → another feature

widget → app

This is lint-enforced via `import/no-restricted-paths` in `eslint.config.mjs`
(zones generated from the real `src/features/*` directory names, so a new
slice is isolated automatically).

---

# Feature Slices

Real, shipped slice names (singular, canonical for all future slices):

`job-offer`, `application`, `cv`, `linkedin-posts`, `dashboard`, `document`,
`billing`

`billing` (TASK-056) holds Stripe Checkout and the webhook-driven
subscription sync; `src/entities/subscription` is its canonical entity and
`src/shared/billing/stripe.ts` its lazily-constructed Stripe client.

Cross-feature composition (e.g. the job-offer detail view triggering
application creation) happens at the widget layer, not via direct
feature-to-feature imports — see `src/widgets/offer-detail-panel`.

---

# Design System

UI:

shadcn/ui

Primitives:

Low-level layout/typography/surface/feedback/interaction primitives live in
src/shared/ui/primitives — compose these instead of hand-writing Tailwind
layout classes (see src/shared/ui/primitives/README.md).

Styling:

Tailwind CSS

Animations:

Framer Motion

Icons:

Lucide React

Palette, typography and UI principles (Deep Navy / Electric Blue / Emerald
brand identity, expressed as tokens in `src/app/globals.css`):

- [docs/design-system/colors.md](docs/design-system/colors.md)
- [docs/design-system/typography.md](docs/design-system/typography.md)
- [docs/design-system/ui-principles.md](docs/design-system/ui-principles.md)

---

# Performance

Default:

- Server Components
- lazy loading
- optimized images
- minimal client JS

Monitor:

- LCP
- CLS
- TBT

---

# Backend & Data Layer

Backend surface: Next.js Route Handlers (`src/app/api/**`). Database:
Supabase PostgreSQL, accessed via `@supabase/supabase-js` (no ORM). See
ADR-009 in `memory-bank/decisions.md` (supersedes ADR-006's Prisma-based
layering).

Flow:

Route Handler

↓

Zod validation

↓

Entity service (`src/entities/{entity}/service.ts` or
`src/features/{feature}/services/*.service.ts` — one module per entity)

↓

Supabase client (`src/shared/db/client.ts`, created per-request via
`@supabase/ssr`)

↓

Supabase PostgreSQL (Row Level Security enforces owner scoping)

Rules:

- Route handlers validate and delegate; they never call the Supabase client directly.
- All Supabase queries for one entity live in one service module, not scattered across route handlers.
- Schema changes only via `supabase/migrations/*.sql` — never hand-edited in the database.
- Every table carries `id`, `owner_id` (references `auth.users`, ADR-005/ADR-009), `created_at`, `updated_at`; RLS policies scope every row to `owner_id = auth.uid()`.
- Supabase URL/keys and all secrets come from environment variables, never hardcoded; `SUPABASE_SERVICE_ROLE_KEY` is server-only and never used in request-handling code — the single sanctioned exception is the Stripe webhook's `sync-subscription.service.ts` (ADR-015), which has no user session and therefore no `auth.uid()` for RLS to match.
- Entity types are canonical: each top-level entity has one `src/entities/{entity}/types.ts` with a hand-written type mirroring the Supabase schema and a Zod schema for that same shape (e.g. `applicationSchema`, `jobOfferSchema`). Route handlers and feature `types.ts` files never redeclare an entity's own fields as a new Zod schema — they import and compose (`.pick`/`.extend`) the entity schema, or import the entity type for request/response DTOs.

This keeps each entity's data-access logic AI-discoverable in one file, and
means SaaS-scale concerns (multi-tenant scoping is already enforced by RLS,
query pagination, auditing via timestamps) are changes to one service module,
not a rewrite.

---

# Future Extensibility

MVP is single-user (see ADR-003 in `memory-bank/decisions.md`), but the
architecture must let later features — automations, new integrations, and
multi-user with full OAuth (Google, LinkedIn, GitHub, Email) — be **additive**,
not a rewrite. See ADR-005/ADR-009.

Rules:

- Top-level domain tables (`profiles`, `job_offers`, `applications`, `posts`)
  carry an `owner_id uuid references auth.users` column from the first
  migration. Adding real multi-user support later means the RLS policies
  already enforce per-owner isolation — no new scoping logic needed.
- Auth stays on Supabase Auth from day one, configured with a single seeded
  user (email/password). Adding Google/LinkedIn/GitHub OAuth providers later
  is a toggle in the Supabase dashboard, not a framework swap.
- The AI service layer (`src/shared/ai/`) is already provider-agnostic
  (ADR-001) — new automations call the same `AiService` interface, they don't
  bypass it.
- Feature-Sliced layout isolates each feature under `src/features/*`; new
  features (automations, integrations) are added as new slices without
  touching existing ones.
- Monorepo tooling (npm workspaces + Turborepo) was evaluated and deferred
  (ADR-012) — see [docs/MONOREPO.md](docs/MONOREPO.md) for the audit,
  readiness criteria, and the future mobile (React Native/Expo) strategy.
