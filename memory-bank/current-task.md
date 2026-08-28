# Current Tasks

## Current Sprint

### Feature: TASK-052 — Recruiter notes on applications

Status:

Implemented + fix round 1 applied. Pending re-review via `/task-cycle`.

Fix round 1 (from Opus review):
- #1 (medium): `aria-label="Recruiter notes"` on the Textarea — it's a bare
  `<textarea>` with no implicit label; matches the
  `aria-label="Application status"` precedent.
- #2: `key={application.id}` on `<ApplicationNotes>` in the panel so the
  useState-seeded notes can't leak between offers on a client nav.
- #3: service now writes `notes.trim() || null`, so clearing notes restores
  `null` instead of storing `''`.
- #4: `maxLength={10_000}` on the Textarea so the server cap is visible
  client-side.

What shipped:
- `supabase/migrations/20260828130000_application_notes.sql`: `alter table
  applications add column notes text` — one nullable column, no history
  table.
- `src/entities/application/types.ts`: `notes: string | null` on
  `Application` + `notes: z.string().nullable()` on `applicationSchema`.
- `src/entities/application/service.ts`: `toApplication` maps `notes`;
  `applicationService.update` widened additively from `{ status }` to
  `{ status?, notes? }` — builds the patch object from whichever keys are
  present, so status-only calls are unchanged.
- `src/features/application/services/update-notes.service.ts`: owner-check +
  reuses `ApplicationNotFoundError` from update-status.service (re-exported).
- `src/app/api/applications/[id]/route.ts`: PATCH, Zod `{ notes:
  string().max(10_000) }`, delegates to the service, 404 on
  `ApplicationNotFoundError` — mirrors `[id]/status/route.ts`.
- `src/features/application/api/application.api.ts` +
  `types.ts`: `updateApplicationNotes` client fn +
  `UpdateApplicationNotesResponse`.
- `src/features/application/hooks/use-update-application-notes.ts`: mirrors
  use-update-application-status (toast + `router.refresh()`).
- `src/features/application/components/application-notes.tsx`: Card +
  Textarea + Save button, reusing shared primitives.
- Wired through `src/widgets/offer-detail-panel` (new `application` prop) →
  `OfferDetail` (`applicationNotes?: ReactNode`, ADR-008 boundary kept) →
  `offers/[id]/page.tsx` passes the existing `application` lookup.

Checks: typecheck, lint (only the pre-existing Avatar `<img>` warning),
build, 21 tests — all green. Design-review loop (Playwright) not run: needs a
live authenticated dev server; the notes card is built entirely from the
same Card/Textarea/Button/Spinner primitives already used 6× on that page.
