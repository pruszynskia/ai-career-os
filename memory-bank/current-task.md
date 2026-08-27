# Current Tasks

## Current Sprint

### Feature: TASK-048 — Unify Offers and Applications into one view

Status:

Implemented + review fix round 1 applied. Pending re-review via `/task-cycle`.

Fix round 1 (from Opus review):
- Duplicate applications per offer: `listOffersWithApplication` now builds
  the offer→application map keep-first (findMany is `updated_at desc`, so
  most-recent wins) instead of `new Map(entries)` keep-last; `ponytail:`
  comment names the missing unique constraint + absent createApplication
  guard.
- Recruiter message was unreachable anywhere in the UI after
  `ApplicationList` was deleted (offer detail only shows a freshly
  *generated* message). Unified row now renders
  `application.recruiterMessage` (`line-clamp-2`) for tracked offers.
- `OfferWithApplication` moved from the `'server-only'` service module to
  `src/features/job-offer/types.ts`; service + widget both import it from
  there.
- Added a `ponytail:` comment on the service's JS-side join / embed
  over-fetch (full `sent_cv` content + duplicate offer rows).
- Doc drift: `docs/design-system/components.md` "single-pane
  `offers`/`applications` pages" → "single-pane `offers` page".
  `memory-bank/project-context.md` left as-is (frozen at "no code shipped
  yet"; no single line cleanly falsified, updating one line adds noise).

Notes:

`/offers` and `/applications` merged into one route at `/offers`. Every
offer now renders once, annotated with its application status
("Not tracked" badge, or the interactive `ApplicationStatusSelect`
pipeline) instead of appearing on two overlapping pages.

Data layer: new feature service
`src/features/job-offer/services/list-offers-with-application.service.ts`
exports `OfferWithApplication` (`JobOffer & { application: ApplicationBundle
| null }`) and `listOffersWithApplication(filter, opts)` — composes the
existing `jobOfferService.findMany` (TASK-040 search/sort/favorites filters)
with `applicationService.findMany`, joining in JS by `jobOfferId`. No new
table, no new SQL.

UI: new widget `src/widgets/unified-offer-list/unified-offer-list.tsx`
merges the old `OfferList` row (title link, company·source·match, Expired
badge, favorite toggle, `DeleteOfferButton`) with the old `ApplicationList`
row's status/actions (`ApplicationStatusSelect` + "Download sent CV" when
tracked). Cross-feature composition lives at the widget layer per
ARCHITECTURE.md. `src/app/(app)/offers/page.tsx` rewired to the new service
+ widget; still reuses `OfferFilters` (TASK-040) as the only search UI.

Removed (the old split-view stack):
- Route `src/app/(app)/applications/` (page + loading)
- `src/widgets/company-search/` (its title/company search is covered by
  TASK-040's server-side ilike in `jobOfferService.findMany`)
- `src/features/job-offer/components/offer-list.tsx`,
  `src/features/application/components/application-list.tsx` (only consumers
  were the page + company-search)
- `src/features/application/services/search-applications.service.ts`,
  `src/features/application/hooks/use-search-applications.ts`
- `jobOfferService.findUnapplied`,
  `applicationService.findManyWithOfferSearch`
- `GET /api/applications` + `searchApplicationsAndOffers` client fn +
  `SearchApplicationsResponse` type (all served only the deleted page;
  `POST /api/applications` for Track Application is untouched)
- "Applications" entry in `NAV_ITEMS` (`src/widgets/nav/sidebar.tsx`)

Link fixes for the removed route: two `/applications` hrefs in
`get-notifications.service.ts` and the post-track `router.push` in
`offer-detail.tsx` now point at `/offers`.

Track Application stays reachable from the offer detail page (row title
links there). typecheck / lint / build / tests all green. Playwright
design-review loop not run in this phase — deferred to `/review-task`
(needs a running authenticated app).

---

---
