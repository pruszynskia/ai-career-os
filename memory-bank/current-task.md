# Current Tasks

## Current Sprint

### Feature: TASK-007 — Main CV optimization

Status:

TODO — next task to implement (`/implement-task TASK-007`)

Notes:

Depends on TASK-005, TASK-006 (both done). Operates on the master `CvDocument` established in TASK-006. See `backlog/mvp.yaml` for full acceptance criteria.

---

## Completed

- TASK-001 — Initialize repository foundation
- TASK-002 — Database schema and Prisma setup
- TASK-003 — Minimal single-user authentication
- TASK-004 — App shell, layout, navigation and providers
- TASK-005 — Provider-agnostic AI service layer (`src/shared/ai/`: `AiService` interface, Anthropic + OpenAI adapters, `AI_PROVIDER` env selection, Zod-validated `generateStructured`, `prompts/` convention)
- TASK-006 — CV upload and parse into structured profile (`src/features/cv/`: PDF/DOCX text extraction via pdf-parse/mammoth, AI structuring into `Profile` via the parse-cv prompt, master `CvDocument` persisted; `/profile` renders the parsed profile and upload form)
