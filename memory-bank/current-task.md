# Current Tasks

## Current Sprint

### Feature: TASK-045 — Offer delete capability

Status:

Implemented, review fix pass round 1 applied. Pending re-review via `/task-cycle`.

Notes:

Delete path added end to end. Entity layer: `jobOfferService.delete(id)`
(RLS-scoped `.delete().eq('id')`, mirrors `update`),
`cvDocumentService.deleteByJobOffer(jobOfferId)` (removes non-master docs —
tailored CVs / cover letters — with an `is_master=false` guard),
`applicationService.existsForOffer(ownerId, jobOfferId)`. Feature service
`deleteOffer` (`src/features/job-offer/services/delete-offer.service.ts`)
throws `OfferHasApplicationError` when an application exists, otherwise
deletes the offer's tailored docs then the offer — two sequential deletes,
not a transaction (`ponytail:` comment, fine at single-user scale; no FK
has `ON DELETE`, and `applications`→`job_offers` is the only blocking ref).
`DELETE` handler added to `src/app/api/offers/[id]/route.ts` alongside
TASK-035's PATCH: 404 on `OfferNotFoundError`, 409 on
`OfferHasApplicationError`. Client: `deleteOffer` in `job-offer.api.ts`,
`useDeleteOffer(redirectTo?)` hook (toast + `router.push(redirectTo)` on the
detail page, `router.refresh()` on the list). Shared `DeleteOfferButton`
(confirm dialog reusing the `Dialog` primitive, `DialogFooter showCloseButton`
for Cancel) wired into `offer-list.tsx` (CardAction) and `offer-detail.tsx`
(header slot, `redirectTo="/offers"`).

Review fix pass: hook-level `router.refresh()` + call-level `router.push`
raced on the detail route (refresh re-rendered the now-`null` offer page →
`notFound()` flash); collapsed into `useDeleteOffer(redirectTo?)` branching
push-vs-refresh in one place. Also removed a dead `size` prop and a dead
`OfferNotFoundError` re-export, added a Cancel button to the confirm dialog,
and marked the non-atomic delete with a `ponytail:` comment.

---

### Feature: TASK-042 — Profile automatic CV/application score

Status:

Implemented, review fix pass round 2 applied. Pending re-review via `/task-cycle`.

Notes:

`profiles` gained a `score` jsonb column (migration
`20260826110000_profile_score.sql`, applied to the remote Supabase project
`wqaibeijmnubvplydbzg`). `parsedProfileSchema`/`profileSchema`/`Profile`
extended with `score: { overall, metrics: { label, score, note }[] }`,
following the existing `experience`/`projects` storage pattern (jsonb +
`z.unknown()` on the persisted schema). `parseCvSystemPrompt` now also asks
for an overall 0-100 CV-quality score plus 3-5 metrics in the same AI call
that already parses summary/skills/experience/projects — no separate
"calculate score" action or second AI round-trip. New
`ProfileScoreCard` (`src/features/cv/components/profile-score-card.tsx`)
renders the overall score plus per-metric `StatCard`s and notes; shown on
`/profile` only when `profile.score` is present. `ProfileSummary`'s prop
type narrowed to `Pick<ParsedProfile, 'summary'|'skills'|'experience'|
'projects'>` since it no longer needs `score`.

Review fix pass: `ProfileScoreCard` rebuilt on `VStack`/`Grid`/`Heading`/
`Text` primitives instead of hand-rolled Tailwind flex/grid classes (was a
`primitives/README.md` "Bad" example) and `text-3xl` (outside the type
scale, bigger than the page's own H1) replaced with `Heading level={1}`.
Each metric's note now renders once, folded under its `StatCard` instead of
looping the array twice. Scores rounded at render (schema stays a plain
`z.number()`, not `.int()`, so a fractional AI score doesn't hard-fail the
upload). `uploadCv`'s `generateStructured` call given `maxTokens: 16384`
(was the adapter default) since the structured output has grown twice now
(projects, then score+notes) against Gemini's thinking-token budget.
`ProfileScoreCard`'s key switched to `${label}-${index}` to survive
duplicate AI-generated labels, matching `ProfileSummary`'s convention.
`page.tsx` now imports `ParsedProfileScore` directly instead of indexing
`ParsedProfile['score']`.

Round 2: `Heading level={1}` rendered a second `<h1>` on `/profile`
(alongside the page's own `PageHeader` `<h1>`) - switched to
`<Heading level={1} as="h2">` to keep the visual size but fix the document
outline.

---

### Feature: TASK-041 — Profile personal projects from CV

Status:

Implemented, review fix pass round 2 applied. Pending re-review via `/task-cycle`.

Notes:

`profiles` gained a `projects` jsonb column (migration
`20260826100000_profile_projects.sql`, applied to the remote Supabase
project `wqaibeijmnubvplydbzg`). `parsedProfileSchema`/`profileSchema`/`Profile` extended
with `projects: { name, description, technologies, url }[]`, following the
existing `experience` field's storage pattern (jsonb + `z.unknown()` on the
persisted schema). `parseCvSystemPrompt` now also extracts personal/side/
open-source projects, distinct from work experience, left empty when the CV
has none. `ProfileSummary` renders a Projects card only when
`profile.projects.length > 0`.

Review fix pass: project URLs from the AI aren't guaranteed to have a
scheme (e.g. `github.com/user/repo`) — rendering them straight into `href`
resolved relatively (dead link) and admitted arbitrary schemes; now gated
by an `^https?://` check before rendering as a link, plain text otherwise.
Also guarded `profile.projects` against `undefined` on the profile page
(pre-migration-apply window) and aligned `rel="noopener noreferrer"` with
the existing external-link convention in `offer-detail.tsx`.

Round 2: applied the migration to the remote Supabase project — until it
landed, `profileService.upsert` sent a `projects` field PostgREST didn't
recognize and every CV upload failed with PGRST204. Also fixed an
under-indented block in `profile-summary.tsx` left by the round-1 edit
(`npm run format` on that file only).

---

### Feature: TASK-040 — Search improvements

Status:

Implemented, reviewed, approved. Pending commit via `/task-cycle`.

Notes:

`jobOfferService.findMany` gained an optional `query` (title/company
substring, server-side via `.or(ilike)`) and `opts.sort`
(`createdAt`/`matchScore`/`company`). New `OfferFilters` client component
(`src/features/job-offer/components/offer-filters.tsx`) adds a search input,
sort select and "Favorites only" toggle to `/offers`, all URL-param driven
(`?q=&sort=&favorite=1`) so filters survive a refresh/back-nav.
`OfferList` gained an `isFiltered` empty-state variant.

Review fix pass: a raw user query containing `,` broke the PostgREST
`.or()` filter (comma is the condition separator) — fixed by
`buildSearchOrFilter` (`src/shared/utils/offer-search.ts`, extracted out of
`entities/job-offer/service.ts` because that file imports `server-only` and
can't be unit-tested directly), which double-quotes the ilike value and
escapes embedded `"`/`\`; covered by
`tests/smoke/unit/offer-search.test.ts`. Also fixed: typing in the search
box without pressing Enter then changing sort/favorites silently dropped the
typed text — sort/favorite `onChange` now call `form.requestSubmit()` and
`onSubmit` reads all three fields from one `FormData` pass. Verified live via
Playwright against `/offers`.

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
- TASK-027 — Monorepo evaluation, deferred (audited: no existing `turbo.json`/workspaces/`packages/` tooling; readiness criteria and future mobile (React Native/Expo) strategy documented in `docs/MONOREPO.md`; see ADR-012)
- TASK-033 — Profile job preference settings (11 new columns on `profiles` via migration `20260825120000_profile_job_preferences.sql`, applied to the remote Supabase project (`wqaibeijmnubvplydbzg`); `profileService.updatePreferences`; new `src/features/profile` slice with a React Hook Form + Zod `JobPreferencesForm`, added as a new dependency by explicit user choice over the codebase's existing plain-`useState` form convention; `vitest.config.ts` gained a `@` path alias so tests can import `@/`-aliased modules)
- TASK-034 — Enterprise UI/UX audit and redesign (`/design-review` run across every route; fixed two unlayered rules in `globals.css` that cascade-defeated Tailwind utilities app-wide — a self-referential `--font-sans` that fell back to serif everywhere, and unlayered `* {padding/margin:0}` and `a {text-decoration:none}` resets that zeroed every `Card`'s padding and killed every `.underline`/`hover:underline` utility; `AddOfferForm` wrapped in the existing `Card`; findings in `docs/design-system/ui-principles.md`'s "Audit findings" section)
- TASK-038 — Document editor and persistent document history (`cvDocumentService.update`/`findMany`; new `cv_documents.kind` enum column distinguishing Master/Optimized/Tailored/Cover Letter, migration applied to the remote Supabase project; cover-letter generation now persists a `CvDocument`; shared `DocumentEditor`/`document.ts` in `src/shared` reused by `cv` and `job-offer` features; new `src/features/document` slice and `/documents` route, added to the sidebar nav)
