# Current Tasks

## Current Sprint

### Feature: TASK-057 — Billing portal and account settings page

Status: **done** — green on typecheck/lint/test/build. Playwright
design-review loop not run (non-interactive session, backend-adjacent
settings page) — needs a visual pass on `/settings` during review.

What shipped:

- `src/features/billing/services/create-portal-session.service.ts` —
  `createPortalSession(ownerId)` reads the owner's subscription via
  `subscriptionService.findByOwnerId`, throws `NoStripeCustomerError` if none
  exists, otherwise creates a Stripe `billingPortal.sessions` session with
  `return_url` back to `/settings`. Duplicates the private `siteOrigin()`
  helper from `create-checkout-session.service.ts` (same reasoning as that
  file's own comment: not exported, and exporting it isn't in this task's
  scope).
- `src/app/api/billing/portal/route.ts` (POST) — thin: `getOwnerId()`, calls
  the service, returns `{ url }`; maps `NoStripeCustomerError` to a 422
  instead of a 500, mirroring the checkout route's error-mapping structure.
- `src/features/billing/components/plan-badge.tsx` — presentational, maps
  `SubscriptionStatus` to a `Badge` variant (active/trialing → success,
  past_due/unpaid → destructive, everything else → secondary).
- `src/features/billing/components/billing-panel.tsx` — client component;
  renders `PlanBadge` + renewal date + a "Manage billing" button that
  `fetch()`s `/api/billing/portal` and redirects to the returned URL when a
  subscription row exists, otherwise an "Upgrade to Pro" CTA linking to
  `/pricing`. No new hook/api file — the fetch is inline, since this task's
  `scope:` list doesn't include one and the checkout feature's `useMutation`
  hook lives in `features/marketing` (FSA forbids importing it cross-feature).
- `src/app/(app)/settings/page.tsx` — new route; loads the owner's
  subscription through `subscriptionService.findByOwnerId` and renders
  `BillingPanel` inside `AppPageLayout`.
- `src/widgets/nav/sidebar.tsx` — added a `Settings` nav entry (`lucide-react`
  icon) pointing at `/settings`, alongside the existing sign-out action.

Validation:

- `npm run typecheck` — pass
- `npm run lint` — pass (1 pre-existing unrelated `no-img-element` warning in
  `Avatar.tsx`)
- `npm run test` — 27 passed (no new tests: this is UI plumbing over an
  already-tested entity service and a thin Stripe wrapper with no test
  precedent — `create-checkout-session.service.ts` has none either)
- `npm run build` — pass; `/settings` and `/api/billing/portal` both compile
  as dynamic routes

Not verified in this session: an actual round trip into Stripe's hosted
customer portal (needs live `STRIPE_SECRET_KEY` and a real Stripe customer)
— code typechecks against the Stripe SDK; a live smoke test is a follow-up.

### Feature: TASK-056 — Subscriptions schema, Stripe Checkout and webhook

Status: **done** — implementation complete (migration, entity, services,
routes, pricing-table wiring, ADR-015, docs) and green on
typecheck/lint/test/build.

The one out-of-scope touch: `src/proxy.ts` gates every `/api` path behind a
signed-in session (TASK-055: "Every `/(app)` and `/api` path stays gated").
Stripe calls `POST /api/stripe/webhook` with no session cookie at all, so
without adding that path to `PUBLIC_PATHS`, the proxy would redirect
Stripe's webhook request to `/sign-in` before the route handler's signature
verification ever runs. `src/proxy.ts` was not in TASK-056's `scope:` list;
Andrzej signed off on the one-line addition (`/api/stripe/webhook` to
`PUBLIC_PATHS`, commit `088fcdc`) since route-level signature verification is
the actual security boundary for that path.

What's in place:

- `supabase/migrations/20260905090000_subscriptions.sql` — `subscriptions`
  table (`owner_id`, `stripe_customer_id`, `stripe_subscription_id` unique,
  `status`, `plan`, `current_period_end`), unique index on `owner_id`, index
  on `stripe_customer_id`, `owner_all` RLS policy.
- `src/shared/billing/stripe.ts` — lazily-constructed `Stripe` client reading
  `STRIPE_SECRET_KEY`, `server-only`.
- `src/entities/subscription/{types.ts,service.ts}` — `Subscription` type +
  Zod schema; `findByOwnerId`, `findByStripeCustomerId`, `upsertFromStripe`
  (takes an optional `SupabaseClient` so the webhook can pass
  `createAdminClient()` without the entity service ever calling it itself).
- `src/features/billing/services/create-checkout-session.service.ts` —
  creates/reuses the Stripe customer, returns a Checkout session URL for the
  `pro` plan's `STRIPE_PRICE_ID_PRO`.
- `src/features/billing/services/sync-subscription.service.ts` — the one
  caller of `createAdminClient()` in request-handling code; reads `owner_id`
  from the Stripe subscription's own metadata (stamped at Checkout-session
  creation), upserts into `subscriptions`.
- `src/app/api/billing/checkout/route.ts` (POST) — thin: `getOwnerId()`,
  Zod-validates `{ plan: 'pro' }`, calls the service, returns `{ url }`.
- `src/app/api/stripe/webhook/route.ts` (POST) — verifies
  `STRIPE_WEBHOOK_SECRET` against the raw body, handles
  `checkout.session.completed` / `customer.subscription.updated` /
  `customer.subscription.deleted`.
- `src/features/marketing/components/checkout-button.tsx` (new, not in
  original scope list but required once `PricingTable` became a server
  component reading auth state — a client component is the only way to wire
  a button click to `fetch('/api/billing/checkout')`) — client button posting
  to the checkout route and redirecting to the returned Stripe URL.
- `src/features/marketing/components/pricing-table.tsx` — now `async`, reads
  `supabase.auth.getUser()`; signed-in visitors see `CheckoutButton` on the
  `pro` plan, signed-out visitors still see the `/sign-up` CTA.
- ADR-015 in `memory-bank/decisions.md`, billing section in
  `docs/TECH_STACK.md`, `billing` slice note in `ARCHITECTURE.md`.

Validation:

- `npm run typecheck` — pass
- `npm run lint` — pass (1 pre-existing unrelated `no-img-element` warning)
- `npm run test` — 23 passed (no new tests added; no existing entity/feature
  service in this codebase has one either)
- `npm run build` — pass, with or without Stripe env vars set (client is
  lazy)

Not verified in this session: an actual Stripe test-mode Checkout completing
end-to-end (needs live `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET`/
`STRIPE_PRICE_ID_PRO` and the Stripe CLI or a deployed webhook URL) — code
paths for `checkout.session.completed` / `customer.subscription.updated` /
`customer.subscription.deleted` are implemented and typecheck against the
Stripe SDK's types, but a live smoke test is a follow-up, not blocking.

### Feature: TASK-055 — Public marketing landing and pricing pages

Status: Implemented; gate green (typecheck / lint / test / build). Playwright
design-review loop not run (non-interactive session) — needs a visual pass on
`/` and `/pricing` during review.

First public surface: before this, `src/app/page.tsx` was
`redirect('/dashboard')` and `src/proxy.ts` sent every unauthenticated request
to `/sign-in`.

What shipped:

- `docs/PRODUCT.md`: new **Pricing & Packaging** section — the single source
  of truth for tier names, limits and prices. Two plans: **Free** (€0/mo,
  10 AI actions/mo) and **Pro** (€12/mo, 500 AI actions/mo). Both include the
  full tracker; the plan only limits the monthly AI-action allowance. Defines
  what counts as one AI action (match score, tailored CV, recruiter message,
  post draft) and the trial model (no time-limited trial — Free is the trial,
  no card). TASK-056/058/059 read this section.
- `src/features/marketing/components/pricing-table.tsx`: new `marketing` slice.
  Exports `PLANS` constant (`Plan` / `PlanId` types, `aiActionsPerMonth` field
  for TASK-058/059) and `PricingTable` — composed from `Grid`/`VStack`/
  `HStack`/`Card`/`Button` primitives, CTA is a `<Link href="/sign-up">`.
  Tier definition lives here once; PRODUCT.md mirrors it in prose.
- `src/app/(marketing)/layout.tsx`: public shell — header with logo + Sign in
  / Sign up links, no app sidebar. Composed from `Box`/`Container`/`HStack`/
  `Section` primitives.
- `src/app/(marketing)/page.tsx`: owns `/`. `force-dynamic`; calls
  `supabase.auth.getUser()` and `redirect('/dashboard')` for a signed-in
  visitor, otherwise renders the landing (hero, three highlights, embedded
  `PricingTable`). Has `metadata`.
- `src/app/(marketing)/pricing/page.tsx`: `/pricing` — heading + `PricingTable`
  + extra `/sign-up` CTA. Static. Has `metadata`. No auth redirect so a
  signed-in user can still view it (TASK-056 wires the CTA to checkout).
- `src/app/page.tsx`: **deleted**. `/` is now owned by
  `src/app/(marketing)/page.tsx`; the two cannot coexist (parallel routes
  resolving to `/`). The signed-in→`/dashboard` redirect moved into that page.
- `src/proxy.ts`: added `/` and `/pricing` to `PUBLIC_PATHS` (exact-match
  list). Every `/(app)` and `/api` path stays gated → `/sign-in`.

Notes / deviations:

- Scope named `src/app/page.tsx` as a file to modify; it had to be deleted
  instead because `src/app/(marketing)/page.tsx` (also in scope) is the `/`
  route and Next.js forbids two pages resolving to the same path. Behaviour
  matches the acceptance criteria for `/`.
- No `pricing-table` CTA to Stripe checkout — that is TASK-056.

Validation:

- `npm run typecheck` — pass
- `npm run lint` — pass (1 pre-existing unrelated `no-img-element` warning in
  `Avatar.tsx`)
- `npm run test` — 23 passed
- `npm run build` — pass; `/` is `ƒ` (dynamic), `/pricing` is `○` (static)
- Playwright design-review loop not run (non-interactive) — needs a visual
  pass on `/` and `/pricing` during review.
