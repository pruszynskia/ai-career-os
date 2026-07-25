# Current Tasks

## Current Sprint

### Feature: TASK-009 — Match scoring

Status:

TODO — next task to implement (`/implement-task TASK-009`)

Notes:

Depends on TASK-005, TASK-006, TASK-007, TASK-008 (all done). See `backlog/mvp.yaml` for full acceptance criteria.

---

## Completed

- TASK-001 — Initialize repository foundation
- TASK-002 — Database schema and Supabase Postgres setup (migrated from Prisma/PostgreSQL — see ADR-009)
- TASK-003 — Minimal single-user authentication (migrated from Auth.js to Supabase Auth — see ADR-009)
- TASK-004 — App shell, layout, navigation and providers
- TASK-005 — Provider-agnostic AI service layer (`src/shared/ai/`: `AiService` interface, Anthropic + OpenAI adapters, `AI_PROVIDER` env selection, Zod-validated `generateStructured`, `prompts/` convention)
- TASK-006 — CV upload and parse into structured profile (`src/features/cv/`: PDF/DOCX text extraction via pdf-parse/mammoth, AI structuring into `Profile` via the parse-cv prompt, master `CvDocument` persisted; `/profile` renders the parsed profile and upload form)
- TASK-007 — Main CV optimization
- TASK-008 — Add job offer by link with raw-text fallback (`src/features/job-offer/`: URL fetch + `html-to-text` stripping with raw-text fallback, AI structuring into `JobOffer` via the parse-offer prompt, favorite toggle; `/offers` lists offers and the add-offer form)
- TASK-017 — Shared Design System (Deep Navy / Electric Blue / Emerald tokens in `src/app/globals.css`; docs under `docs/design-system/`; see ADR-010)
- TASK-018 — Playwright visual-QA workflow (`.mcp.json` Playwright MCP server, `docs/DESIGN_REVIEW_WORKFLOW.md`, `/design-review` command, conditional Step 4 visual-QA sub-step in `/implement-task` and `/fix-task`; exercised against `/sign-in`, which also surfaced and fixed a pre-existing missing `'use client'` on `src/shared/ui/button.tsx`)
- TASK-026 — Shared UI primitives layer (`src/shared/ui/primitives`: Layout/Surface/Typography/Feedback/Interaction primitives; see `src/shared/ui/primitives/README.md`)
- TASK-019 — Reusable components library (`EmptyState`, `PageHeader` in `src/shared/ui`, extracted from duplicated markup; see `docs/design-system/components.md`)
- TASK-020 — Shared layouts (`src/shared/layouts`: `AppPageLayout` extracted from the duplicated page-shell markup and adopted by every route under `src/app/(app)` including the offer detail view; `SplitLayout` built to the same standard for a future list/detail screen but not yet wired to a consumer — no split UI exists in the app today; `PageHeader` gained an optional `subtitle`; documented in `docs/design-system/ui-principles.md` and `components.md`)
- TASK-024 — Domain models (every top-level entity's `src/entities/{entity}/types.ts` now has a canonical Zod schema alongside its hand-written type — `cvDocumentSchema`, `jobOfferSchema`, `applicationSchema`, `postSchema`, `profileSchema`; `applications/[id]/status`, `applications` and `offers/[id]/favorite` route handlers validate by composing/picking from the entity schemas instead of redeclaring fields; documented in `ARCHITECTURE.md`)
- TASK-025 — Application state refactor (the 8 mutation hooks that revalidate RSC-rendered pages — `use-toggle-favorite`, `use-add-offer`, `use-upload-cv`, `use-update-application-status`, `use-schedule-post`, `use-mark-post-sent`, `use-plan-posts`, `use-generate-post` — now call `router.refresh()` in their own `onSuccess` instead of every component wiring it; `docs/STATE_MANAGEMENT.md` gained a "Server-Rendered Reads" section documenting that list/detail data comes from Server Components, not `useQuery`, and mutations revalidate via `router.refresh()` not `invalidateQueries()`)
