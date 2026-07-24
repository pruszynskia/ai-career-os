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
