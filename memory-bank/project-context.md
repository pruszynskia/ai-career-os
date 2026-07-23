# Current Project Context

## Product

AI Career OS

## Current Stage

MVP — pre-implementation. Backlog scoped (`backlog/mvp.yaml`, TASK-001..015,
synced to GitHub Issues #1-15). No code shipped yet.

## Main Goal

Help the single owner get more recruiter attention on LinkedIn and track
every job application (offer, tailored CV, recruiter message, interview
status) without duplicates.

---

# Current Features

Implemented:

- TASK-001 Initialize repository foundation
- TASK-002 Database schema & Prisma setup
- TASK-003 Minimal single-user authentication
- TASK-004 App shell, layout, navigation & providers
- TASK-005 Provider-agnostic AI service layer
- TASK-006 CV upload & parse → structured profile

In Progress:

- (none yet — next up is TASK-007, main CV optimization)

Planned:

- TASK-007 Main CV optimization
- TASK-007 Main CV optimization
- TASK-008 Add job offer by link (paste + fallback)
- TASK-009 Offer match %, tailored CV & recruiter message
- TASK-010 Duplicate offer detection
- TASK-011 Application tracking, status pipeline & company search
- TASK-012 LinkedIn post generation
- TASK-013 Post planning & scheduling
- TASK-014 Dashboard
- TASK-015 CI pipeline & Vercel deployment

---

# Current Architecture

Next.js (App Router)

TypeScript (strict)

Tailwind CSS + shadcn/ui

Server state: TanStack React Query

Client state: Zustand

Database: PostgreSQL + Prisma

AI: provider-agnostic service layer (Anthropic + OpenAI adapters, server-only)

Auth: Auth.js, single seeded credentials account (no OAuth, no multi-user)

---

# Important Decisions

See:

memory-bank/decisions.md
