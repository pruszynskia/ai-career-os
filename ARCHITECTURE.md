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

Forbidden:

shared → feature

entity → feature

---

# Design System

UI:

shadcn/ui

Styling:

Tailwind CSS

Animations:

Framer Motion

Icons:

Lucide React

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
PostgreSQL via Prisma. See ADR-006 in `memory-bank/decisions.md`.

Flow:

Route Handler

↓

Zod validation

↓

Entity service (`src/entities/{entity}/service.ts` or
`src/features/{feature}/services/*.service.ts` — one module per entity)

↓

Prisma Client (`src/shared/db/client.ts` singleton)

↓

PostgreSQL

Rules:

- Route handlers validate and delegate; they never call Prisma directly.
- All Prisma queries for one entity live in one service module, not scattered across route handlers.
- Schema changes only via `prisma migrate` — never hand-edited in the database.
- Every model carries `id`, `ownerId` (ADR-005), `createdAt`, `updatedAt`; index `ownerId` and foreign keys.
- `DATABASE_URL` and all secrets come from environment variables, never hardcoded.

This keeps each entity's data-access logic AI-discoverable in one file, and
means SaaS-scale concerns (tenant scoping, query pagination, auditing via
timestamps) are changes to one service module, not a rewrite.

---

# Future Extensibility

MVP is single-user (see ADR-003 in `memory-bank/decisions.md`), but the
architecture must let later features — automations, new integrations, and
multi-user with full OAuth (Google, LinkedIn, GitHub, Email) — be **additive**,
not a rewrite. See ADR-005.

Rules:

- Top-level domain models (Profile, JobOffer, Application, Post) carry an
  `ownerId` column from the first migration, defaulted to the single seeded
  user. Adding real multi-user support later means enforcing/filtering by
  `ownerId`, not a schema migration.
- Auth stays on Auth.js from day one, configured with only a credentials
  provider for MVP. Adding Google/LinkedIn/GitHub/Email providers later is
  additive config in the same `providers` array, not a framework swap.
- The AI service layer (`src/shared/ai/`) is already provider-agnostic
  (ADR-001) — new automations call the same `AiService` interface, they don't
  bypass it.
- Feature-Sliced layout isolates each feature under `src/features/*`; new
  features (automations, integrations) are added as new slices without
  touching existing ones.
