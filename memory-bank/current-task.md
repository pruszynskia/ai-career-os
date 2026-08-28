# Current Tasks

## Current Sprint

### Feature: TASK-051 — Advanced duplicate detection (match signal, recency window, user resolution)

Status:

Implemented + fix round 1 applied. Pending re-review via `/task-cycle`.

Fix round 1 (from Opus review):
- #1: `addOffer` no longer `break`s on the first fingerprint match (row
  order from `listFingerprints` is unspecified). It scans all matches and
  keeps the strongest signal via `SIGNAL_RANK`
  (canonical-url > content-hash > company-title), so the notice names the
  right signal and links the right offer when several duplicates exist.
- #2: `isDuplicateWithinWindow` param narrowed from
  `FingerprintMatchSignal | null` to `FingerprintMatchSignal`; the caller
  checks `!signal` first. Dropped the now-impossible null test from the
  suite (21 tests, was 22).
- #3: `role="status"` moved off the wrapper `<div>` onto the `<p>` so the
  Keep both / Delete this one buttons aren't inside the live region.

What shipped:
- `src/shared/utils/offer-fingerprint.ts`: `isDuplicateFingerprint` now
  returns `FingerprintMatchSignal | null` (`'canonical-url' | 'content-hash'
  | 'company-title'`), strongest signal first, instead of a boolean. New
  `isDuplicateWithinWindow(signal, existingCreatedAt, now?)` +
  `COMPANY_TITLE_RECENCY_WINDOW_MS` (30 days) — a `company-title`-only match
  counts only when the existing offer is recent; URL/content matches are
  unconditional. Stale ponytail comment about the missing upgrade path
  removed.
- `src/entities/job-offer/service.ts`: `listFingerprints` selects and maps
  `created_at` → `createdAt: Date`.
- `src/features/job-offer/services/add-offer.service.ts`: loops fingerprints,
  applies `isDuplicateWithinWindow`, returns `{ jobOffer, duplicateOfferId,
  duplicateMatchSignal }`. Offer still created first (no blocking).
- `src/features/job-offer/types.ts`: `AddOfferResponse.duplicateMatchSignal?`.
- `src/app/api/offers/route.ts`: passes `duplicateMatchSignal` through.
- `src/features/job-offer/components/add-offer-form.tsx`: passive notice
  replaced with one that names the matched signal and offers **Keep both**
  (dismiss) and **Delete this one** (reuses `useDeleteOffer` →
  `DELETE /api/offers/[id]` from TASK-045) targeting the just-created offer.
- `tests/smoke/unit/offer-fingerprint.test.ts`: rewritten — one case per
  match signal, null case, and both sides of the recency window.

Validation: `npm run test` (22 passed), `npm run typecheck`, `npm run lint`
(0 errors, 1 pre-existing Avatar warning), `npm run build` — all green.

Not run: Playwright design-review loop — no local Supabase/seeded data (same
as TASK-048/049/050). UI change is a text + two-button swap reusing existing
`Button` variants; no new visual primitives.

No embeddings, vector store, semantic similarity, duplicates table, or
persisted dismissals added.
