# Current Tasks

## Current Sprint

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
