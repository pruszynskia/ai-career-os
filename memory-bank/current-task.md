# Current Tasks

## Current Sprint

### Feature: TASK-050 — Application status history (timeline + recent-activity card)

Status:

Implemented + fix round 1 applied. Pending re-review via `/task-cycle`.

Fix round 1 (from Opus review):
- M1: migration now backfills existing applications — an APPLIED seed event
  at `created_at` for every row, plus current status at `updated_at` where
  status has moved (mirrors the `cv_document_kind` backfill). Without this
  the feature read empty on all existing data.
- M2: history writes in `create-application.service.ts` and
  `update-status.service.ts` are now best-effort (`.catch` +
  `console.error`) — a failed event no longer 500s a committed
  `createApplication` (which has no duplicate guard, so a retry would
  double-create). `ponytail:` comments name the RPC upgrade path.
- L1: `applicationStatusEventService.findRecent` filters out rows whose
  `application`/`job_offer` embed didn't resolve instead of dereferencing
  `null` and crashing the dashboard render.
- L2: `updateApplicationStatus` early-returns when the status is unchanged
  (guard is free — `existing` already fetched), so no-op writes don't
  append duplicate events.
- L3: `applicationService.existsForOffer` removed; its one caller
  (`delete-offer.service.ts`) now uses `findByOffer(...) !== null`.
- L4: deviation from the "every table carries `updated_at`" rule recorded
  as ADR-014 in `memory-bank/decisions.md`.

Not re-run: Playwright design-review loop (no local Docker/Supabase, no
seeded data — same as TASK-048/049). Round-1 fixes are data/back-end only;
no visual change.

What shipped:
- Migration `supabase/migrations/20260828120000_application_status_events.sql`:
  `application_status_events` (id, owner_id, application_id FK
  `on delete cascade`, status `application_status`, created_at). Immutable
  event log — no `updated_at`. Indexes on application_id + owner_id, same
  `owner_all` RLS policy as every other table.
- New entity `src/entities/application-status-event/`:
  - `types.ts` — `ApplicationStatusEvent`, `applicationStatusEventSchema`
    (reuses `applicationStatusSchema`), `RecentStatusEvent` (= event +
    `jobOffer`, mirrors `ApplicationBundle`).
  - `service.ts` — `create`, `findMany({ applicationId })` (oldest→newest),
    `findRecent({ ownerId }, { take })` (newest first, nested embed
    `application:applications(job_offer:job_offers(*))`).
- `applicationService.findByOffer(ownerId, jobOfferId)` — returns the most
  recent application row for an offer (existsForOffer only returned a bool).
- Event written after `applicationService.update` succeeds in
  `update-status.service.ts`, and after `applicationService.create` in
  `create-application.service.ts` (seed APPLIED event). `applications.status`
  still updated in place — events are additive history.
- `src/features/application/components/application-timeline.tsx` — Card
  listing events oldest→newest via `APPLICATION_STATUS_LABELS` + `createdAt`.
- `src/features/dashboard/components/recent-activity-card.tsx` — Card linking
  each recent event to `/offers/{id}` with title · company · status · date.
- Composition: `OfferDetail` gained an `applicationTimeline?: ReactNode`
  slot (job-offer feature can't import the application feature — ADR-008);
  `OfferDetailPanel` widget fills it with `<ApplicationTimeline>` when there
  are events. Offer page fetches application + events; dashboard page fetches
  `findRecent(..., { take: 5 })` and renders `<RecentActivityCard>`.

Checks: typecheck, lint (0 errors — no cross-feature import), test (16
passed), build all green.

Not run: Playwright design-review loop (needs running app + seeded Supabase).
Both new components reuse `Card`/`EmptyState`/`Link` exactly like their
sibling dashboard cards — low visual risk; flag for review phase.
