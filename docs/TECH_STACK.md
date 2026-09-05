# Technology Stack

## Purpose

This document defines the technology stack used in AI Career OS. It uses the
starter kit's default stack (Next.js/TypeScript/Tailwind/shadcn) with
Supabase as the backend platform.

Goals:

- use modern production-ready technologies
- optimize developer experience
- keep architecture scalable
- make the project easy to understand for future developers
- enable efficient AI-assisted development

---

# Frontend Application

## Framework

**Next.js**

Version:

- latest stable version

Usage:

- application framework
- routing
- server-side rendering
- server components
- API integration
- SEO optimization

Why:

- industry standard React framework
- excellent SaaS support
- strong performance capabilities

---

## Language

**TypeScript**

Configuration:

- strict mode enabled

Usage:

- application code
- API contracts
- component props
- domain models

Why:

- improves maintainability
- prevents runtime errors
- better AI-generated code quality
- easier refactoring

---

# UI Layer

## Styling

**Tailwind CSS**

Usage:

- utility-first styling
- responsive layouts
- design consistency

Rules:

- avoid custom CSS unless required
- reuse existing design patterns
- keep spacing and colors consistent

---

## Component Library

**shadcn/ui**

Usage:

- reusable UI primitives
- accessible components
- consistent design system

Components:

- Button
- Dialog
- Form
- Input
- Dropdown
- Card
- Toast
- Navigation

Why:

- production-ready
- customizable
- based on Radix UI
- excellent TypeScript support

---

## UI Primitives

**Radix UI**

Usage:

- accessibility primitives
- complex interactions

Examples:

- dialogs
- menus
- popovers
- dropdowns

---

## Icons

**Lucide React**

Usage:

- application icons
- UI actions
- navigation

Rules:

- do not use random SVG icons
- use consistent icon system

---

## Animations

**Framer Motion**

Usage:

- page transitions
- micro interactions
- onboarding animations

Rules:

- animations must improve UX
- avoid unnecessary animations
- respect reduced motion preferences

---

# State Management

## Server State

**TanStack React Query**

Usage:

- API data fetching
- caching
- synchronization
- loading states
- optimistic updates

Examples:

- job offer and application list/detail queries
- user profile
- subscription data

---

## Client State

**Zustand**

Usage:

- local application state
- UI state

Examples:

- modal state
- preferences
- temporary UI data

Rules:

Do not store server data in Zustand.

---

# Forms and Validation

## Form Management

**React Hook Form**

Usage:

- user input
- configuration forms
- profile forms

Why:

- performant
- minimal rerenders
- excellent TypeScript support

---

## Schema Validation

**Zod**

Usage:

- runtime validation
- API validation
- form schemas
- type inference

Example:

```ts
const resourceSchema = z.object({
  name: z.string(),
  tier: z.enum(['basic', 'pro', 'enterprise']),
});
```

---

# API Communication

## API Style

REST API

Communication flow:

```
Component

↓

Custom Hook

↓

Service Layer

↓

API Client

↓

Backend
```

---

## HTTP Client

Recommended:

native fetch API

or

typed API client wrapper

Rules:

- no direct API calls inside components
- all API communication goes through services

---

# Backend

## Runtime

Node.js

Usage:

- backend services
- API routes
- external integrations

---

## API Layer

Next.js API Routes / Server Actions

Usage:

- application backend
- authentication
- business logic

---

# Database

## Database

Supabase PostgreSQL

Usage:

- users (Supabase Auth's `auth.users`)
- profiles, CV documents, job offers, applications, posts
- subscriptions
- analytics

---

## Data access

`@supabase/supabase-js` — no ORM

Usage:

- database access via the Supabase query builder
- schema management via `supabase/migrations/*.sql`, applied with `npm run db:push`
  (`supabase db push --linked`); `npm run db:status` shows local-vs-remote drift.
  Never apply migrations through the Supabase MCP `apply_migration` or the
  dashboard SQL editor — those stamp their own version timestamp, which
  desynchronises the migration ledger from the filenames and breaks `db push`.
- authorization enforced by Row Level Security (`owner_id = auth.uid()`)

Why:

- Postgres + auth + storage from one platform, no separate ORM/connection layer to maintain
- RLS enforces owner scoping at the database level instead of app code
- AI friendly — plain query-builder calls per entity service

---

# Authentication

## Authentication Solution

Supabase Auth, email/password plus Google OAuth

Usage:

- self-serve registration at `/sign-up` with email verification, plus
  forgot/reset-password flows, all through `supabase.auth` (TASK-053)
- "Continue with Google" on `/sign-in` and `/sign-up` calls the
  `signInWithGoogle` server action (`supabase.auth.signInWithOAuth`), which
  redirects through Google and back to `/auth/callback` (TASK-054)
- `scripts/create-owner-user.ts` (`npm run db:seed`) still provisions the
  original owner account but is no longer the only way an account is created
- session handled by `@supabase/ssr`, gate enforced in `src/proxy.ts`
- `NEXT_PUBLIC_SITE_URL` builds the email redirect links (falls back to
  request headers in local dev). `/auth/callback` verifies `token_hash` +
  `type` via `verifyOtp` (stateless — works when the email is opened on
  another device); the PKCE `code` branch handles the Google OAuth callback.
- Load-bearing Supabase dashboard config (no MCP/API tool covers auth config —
  set by hand). Authentication → URL Configuration → Redirect URLs must list:

  ```
  http://localhost:3000/auth/callback
  https://<production-domain>/auth/callback
  ```

  A `redirectTo` not on this list is silently replaced with the Site URL, so
  the templates below pass no query string and the entries must match exactly.
  Authentication → Email Templates → Confirm signup link:

  ```
  {{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email&next=/dashboard
  ```

  Authentication → Email Templates → Reset Password link:

  ```
  {{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password
  ```

- Google provider config is dashboard- and console-side; nothing lands in the
  repo. Authentication → Providers → Google: enable it and paste the Google
  OAuth client ID and secret there (never in `.env*` or a `NEXT_PUBLIC_` var).
  In the Google Cloud console (APIs & Services → Credentials → OAuth client),
  register the Supabase callback as an authorized redirect URI:

  ```
  https://<project-ref>.supabase.co/auth/v1/callback
  ```

  The app's own `/auth/callback` route still needs to be in Supabase's
  Redirect URLs list above (`http://localhost:3000/auth/callback` and the
  production URL) since that is where `signInWithOAuth`'s `redirectTo` points.

Per-account data isolation stays RLS-enforced — a Google account gets its own
`auth.users` row and sees only its own rows. See ADR-003 and ADR-009 in
`memory-bank/decisions.md`.

---

# AI Integration

## AI Provider

Provider-agnostic service layer (`src/shared/ai/`) with Anthropic and OpenAI
adapters behind one interface, selected via environment configuration. See
ADR-001 in `memory-bank/decisions.md`.

Usage:

- CV parsing (uploaded PDF/DOCX → structured profile)
- CV optimization
- job offer field extraction from pasted URL/text
- offer-to-profile match percentage
- offer-tailored CV and recruiter message generation
- LinkedIn post generation and planning

Architecture:

```
Frontend

↓

Backend API (Next.js route handlers)

↓

AI Service Layer (src/shared/ai — AiService interface + adapters)

↓

Anthropic / OpenAI
```

Rules:

- never expose API keys in frontend
- isolate AI logic from UI
- store prompts separately (`src/shared/ai/prompts/`)
- validate structured AI output with Zod

---

# Billing

## Provider

**Stripe** — Checkout for the free-to-paid upgrade and the Stripe webhook as
the single writer of subscription state. See ADR-015 in
`memory-bank/decisions.md`.

Usage:

- `POST /api/billing/checkout` creates a Checkout session for the signed-in
  owner via `src/features/billing/services/create-checkout-session.service.ts`
- `POST /api/stripe/webhook` verifies the Stripe signature and syncs
  `checkout.session.completed` / `customer.subscription.updated` /
  `customer.subscription.deleted` into the `subscriptions` table via
  `src/features/billing/services/sync-subscription.service.ts`
- `src/entities/subscription/service.ts` is the only module reading or
  writing the `subscriptions` table

Environment variables (server-only, never `NEXT_PUBLIC_`):

- `STRIPE_SECRET_KEY` — read only by `src/shared/billing/stripe.ts`
- `STRIPE_WEBHOOK_SECRET` — read only by the webhook route
- `STRIPE_PRICE_ID_PRO` — the Pro plan's Stripe Price id

Rules:

- Stripe is the source of truth for billing state; `subscriptions` is a
  local projection kept current by the webhook, never reconstructed from a
  Checkout redirect
- `createAdminClient()` (service-role, bypasses RLS) is used only in the
  webhook's sync service — every other read goes through the request client
  and RLS

---

# Testing

## Unit Testing

Vitest

Usage:

- utilities
- hooks
- business logic

---

## Component Testing

React Testing Library

Usage:

- component behaviour
- user interactions

---

## End-to-End Testing

Playwright

Usage:

- critical user flows
- authentication
- core scenarios

---

# Code Quality

## Linting

ESLint

Purpose:

- detect problems
- enforce standards

---

## Formatting

Prettier

Rules:

- automatic formatting
- consistent code style

---

## Git Hooks

Husky

Usage:

Before commit:

- lint
- format check
- type check

---

## Commit Convention

Conventional Commits

Examples:

```
feat(<scope>): add <feature>

fix(auth): resolve session issue

docs(api): update documentation
```

---

# Build and Deployment

## Hosting

Vercel

Usage:

- frontend deployment
- preview environments
- production hosting

---

## CI/CD

GitHub Actions

Pipeline:

```
Pull Request

↓

Install dependencies

↓

Lint

↓

Type Check

↓

Tests

↓

Build

↓

Deploy
```

---

# Development Environment

## Package Manager

Recommended:

npm

---

## Node Version

Use:

LTS version

Managed with:

nvm

Example:

```bash
nvm use
```

---

# Architecture Principles

The technology stack follows these principles:

- Type safety first
- Server-first React architecture
- Feature-based organization
- Minimal dependencies
- Reusable components
- Clear separation of concerns
- Production-quality standards

---

# AI Development Compatibility

This stack is optimized for AI-assisted development.

AI agents should:

- follow existing patterns
- reuse dependencies
- avoid introducing unnecessary libraries
- update documentation after architectural changes

Relevant documents:

- `AI_RULES.md`
- `ARCHITECTURE.md`
- `docs/CODING_STANDARDS.md`
- `memory-bank/project-context.md`
