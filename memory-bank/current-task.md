# Current Tasks

## Current Sprint

### Feature: TASK-073 — Offers and applications workspace redesign

Status: **done** — green on typecheck/lint/test/build. Playwright
design-review loop not run (no Playwright MCP tool available in this
environment).

What shipped:

- `unified-offer-list.tsx` — one `Card` per offer replaced with a custom
  row built directly on `surfaceVariants({ elevation: 'ruled' })` (not the
  plain `ListRow` primitive, whose `title`/`supporting`/`meta` slots can't
  hold the row's favorite toggle, delete action, status select and download
  button alongside the link/badge/excerpt content). Every action the Card
  version had is still on the row.
- `offer-detail.tsx` — six stacked full-width `Card`s restructured into a
  sticky summary `Card` (offer facts, match score, favorite/edit actions,
  track-application) on the left and a content column (Tailored CV,
  Recruiter message, Cover letter sections as plain headed sections divided
  by `Divider`, then the injected `applicationNotes`/`applicationTimeline`)
  on the right; `lg:flex-row` with `lg:sticky lg:top-6` on the summary,
  collapsing to one column below `lg`. No hook, mutation or the
  `applicationNotes`/`applicationTimeline` render-prop seam (ADR-008)
  changed.
- `application-status-select.tsx` and `offer-filters.tsx` — raw `<select>`
  replaced with the `Select` primitive. The filters' sort select keeps the
  existing FormData-driven submit via a `name="sort"` prop (Radix renders a
  hidden bubble `<select>` for form participation) and a `formRef` to call
  `requestSubmit()` from `onValueChange`, matching the favorite checkbox's
  existing auto-submit pattern.
- `add-offer-form.tsx` — the duplicate-detection banner's `text-amber-600`
  replaced with `bg-warning`/`text-warning-foreground` (not plain
  `text-warning`, which `docs/design-system/colors.md` measures at 1.67:1 —
  fails contrast on the page background; the badge-pattern pairing is the
  one the docs call out as compliant).
- `application-board.tsx` — column/`"Not tracked"` containers' raw
  `rounded-lg border p-2` replaced with `surfaceVariants({ elevation:
  'raised', padding: 'sm' })`; `BoardCard` stays an actual `Card` and the
  native HTML5 drag-and-drop is untouched.
- `application-timeline.tsx` — the plain `<ol>` of events replaced with the
  `ListRow` primitive (status as `title`, date as `meta`, which already
  renders in `font-mono` i.e. Geist Mono).
- `offers/loading.tsx` — the three `h-32` card-stack skeletons replaced
  with four `h-20` rows in a `gap={0}` `VStack`, matching the ruled-row list.

Not done: `application-notes.tsx` was in scope but had no raw markup or
off-token styling to fix (it's a legitimate `Card` — a form panel), so it
was left unchanged rather than rewritten for its own sake.

### Feature: TASK-071 — App shell, navigation and settings information architecture

Status: **done** — green on typecheck/lint/test/build. Playwright
design-review loop not run (no Playwright MCP tool available in this
environment).

What shipped:

- `sidebar.tsx` — `NAV_ITEMS` replaced with a `NAV_GROUPS` data structure
  (`Workspace`: Dashboard/Offers/Documents/Posts, `Account`: Profile/
  Settings), each group rendered under a mono `Label variant="meta"`
  section heading. Restyled: dropped the filled `bg-card` rail (hairline
  `border-r` only) and the active-item `bg-muted` pill for a `border-l-2
  border-accent` indicator.
- `page-header.tsx` / `AppPageLayout.tsx` — added an optional `eyebrow` prop
  (rendered via `Label variant="meta"`) above the display-face title;
  `/profile` and `/settings` now pass `eyebrow="Account"`, matching the
  sidebar group they sit under.
- **Onboarding redirect**: `onboarding-gate.tsx` (client-side
  `usePathname`/`useEffect` redirect) deleted. Next.js Server Components
  have no API to read the current pathname (verified empirically — no
  request header exposes it without `src/proxy.ts` setting one, which was
  out of scope and, project-wide, exactly the per-request Supabase-call cost
  the original ponytail comment warned about), so a *route group*
  (`src/app/(app)/(protected)/`) is what makes the `/onboarding` and
  `/settings` exemption possible without it: `dashboard`, `offers`,
  `documents`, `posts` and `profile` moved under it (URLs unchanged — route
  groups aren't part of the path), and its new `layout.tsx` does the
  server-side `redirect('/onboarding')` before any protected page renders.
  `src/app/(app)/layout.tsx` is now shell-only (Sidebar/Screen/
  notifications). See `memory-bank/ai-notes.md` for the pathname-in-layout
  constraint.
- Job preferences moved from `/profile` to a new sectioned `/settings`
  (Appearance/Job preferences/Billing/AI usage; `DangerZone` stays after
  them). "Appearance" is a static placeholder note — TASK-067 (dark-mode
  toggle, still `todo`) is what will fill it; do not treat the placeholder
  text as a TASK-067 implementation.
- `SplitLayout` deleted (`src/shared/layouts/split-layout/`, barrel export,
  and its documentation in `docs/design-system/components.md` and
  `ui-principles.md`) — no consumer ever existed.
- `ARCHITECTURE.md`'s Feature Slices list now includes `account`,
  `marketing`, `notification`, `onboarding`, `profile` (previously only 7 of
  12 real `src/features/*` slices were listed).
- `tests/smoke/unit/onboarding.test.ts` — dropped the `isExemptPath` test
  (function deleted with `onboarding-gate.tsx`); `clampStep`/`isPlaceholder`
  tests untouched.

Not done (explicitly out of scope): a command palette, any change to
`src/proxy.ts` or the onboarding step flow, and building a real theme
toggle (TASK-067 owns that).

### Feature: TASK-069 — Elevation model and control refit (flat, ruled, raised)

Status: **done** — green on typecheck/lint/test/build. Playwright
design-review loop not run (no Playwright MCP tool available in this
environment, same limitation as TASK-066/060) — needs a visual pass across
routes during review, since every `Card`/`Button`/`Input`/`Select`/`Dialog`/
`Popover`/`Badge` consumer is affected by this token/primitive change even
though no consumer file itself was edited.

What shipped:

- `Surface.tsx` — `surfaceVariants`'s `elevation` is now `flat` (default: no
  border/background/shadow) / `ruled` (hairline `border-b`) / `raised`
  (`bg-card` + hairline border, `rounded-lg`/6px, no shadow). Dropped the
  unconditional `rounded-xl`/`ring-1 ring-foreground/10` base and the old
  `none`/`sm`/`md` shadow-only `elevation` prop.
- `card.tsx` — `Card` now built on `surfaceVariants({ elevation: 'raised' })`;
  sub-component API (`CardHeader`/`CardTitle`/`CardDescription`/
  `CardAction`/`CardContent`/`CardFooter`) unchanged. Corner radius on the
  header/footer/image slots moved from `rounded-{t,b}-xl` to
  `rounded-{t,b}-lg` to match.
- `dialog.tsx`, `Popover.tsx`, `Select.tsx` (content) — the three remaining
  `rounded-xl`/`ring-1 ring-foreground/10` call sites replaced with
  `rounded-lg border border-border` + `shadow-md` (shadow now scoped to
  these true-overlay surfaces only, never tinted). Dialog's
  `supports-backdrop-filter:backdrop-blur-xs` removed — plain scrim now.
  `DialogFooter`'s `rounded-b-xl` also moved to `rounded-b-lg`.
- `button.tsx`, `input.tsx`, `textarea.tsx`, `Select.tsx` (trigger) — added a
  `comfortable` (32px, the old default) size alongside a new dense `default`
  (28px/`h-7`), matching height across all four controls;
  `icon`/`icon-comfortable` added to `Button` for the same split. Radius
  stays 6px (`rounded-lg`) via the existing base classes.
- `Badge.tsx` — rebuilt as a `font-mono uppercase tracking-wide` label at
  `rounded-xs` (2px), plus new `warning`/`info` variants mapping onto the
  `--warning`/`--info` tokens from TASK-066 (existing `success`/
  `destructive`/`default`/`secondary`/`outline` kept).
- `docs/design-system/ui-principles.md` — rewritten around the three-tier
  elevation model, the "a Card must earn its box" rule (ruled rows for
  collections, raised only for a single stat/panel), and the control-density
  rule; the stale Deep Navy/Electric Blue/Emerald brand-direction text (dead
  since ADR-018/TASK-066) replaced with a pointer at `colors.md`.

Deliberate deviation from the task's literal acceptance wording — flagged,
not silently done: focus rings were **not** repointed at the amber
`--accent` token. `docs/design-system/colors.md`'s contrast table (written
in TASK-066/ADR-018, same day) measures `--accent`/background at 2.04:1 in
light mode, under the WCAG 2.1 SC 1.4.11 3:1 floor for a focus indicator,
and explicitly documents `--ring` staying on `--primary` *because* of that
failure. Switching the ring to amber would satisfy this task's literal
acceptance line but ship a measured accessibility regression the ADR log
already reasoned about. Left `focus-visible:ring-ring`/`border-ring`
unchanged everywhere (already passes at 18.28:1/17.21:1 per that table) and
documented the reason in the rewritten `ui-principles.md`. Everything else
in the task's acceptance list passes as specified.

Two acceptance greps hold only within this task's file scope, not
sitewide: `rounded-full` still appears in `profile-summary.tsx` (pill skill
tags) and `onboarding-stepper.tsx`'s step-number circle — neither file is in
this task's `scope:` list, and per the task's own framing ("Convert feature
screens away from Card - that is TASK-072 through TASK-076"), per-screen
pill/Card cleanup belongs to those later tasks, not this one.

Validation:

- `npm run typecheck` — pass
- `npm run lint` — pass (1 pre-existing unrelated `no-img-element` warning)
- `npm run test` — 61 passed (no new tests — this task is styling/variant
  surface area with no branching logic to unit-test; existing component
  tests, if any, weren't touched)
- `npm run build` — pass

### Feature: TASK-066 — Design token foundation (warm-neutral ramp, neutral-inverse primary, amber accent)

Status: **done** — green on typecheck/lint/test/build. Token-value-only
change in `src/app/globals.css`; no component files touched, no Playwright
loop (this environment has no Playwright MCP tool available, and the change
is a token re-skin with every component import/utility class unchanged —
verified instead via a from-scratch OKLCH→WCAG contrast calculation for
every text-on-surface pairing).

What shipped:

- `src/app/globals.css` — every shadcn semantic colour token (`--background`,
  `--primary`, `--accent`, `--success`, `--destructive`, `--border`,
  `--input`, `--ring`, …) now aliases a Tier-1 primitive (`--neutral-canvas`,
  `--neutral-ink`, `--signal-amber`, `--signal-gold`, `--signal-info`,
  `--status-success`, `--status-destructive`) instead of holding its own
  literal `oklch()` value, defined separately for `:root` and `.dark`. New
  `--warning`/`--warning-foreground` and `--info`/`--info-foreground`
  tokens are wired into `@theme inline` alongside the existing
  `--color-success` pattern. `--radius` is now `0.375rem`, with
  `--radius-xl`..`--radius-4xl` all capped at `0.5rem` (8px) so the four
  existing `rounded-xl` call sites (`dialog.tsx`, `Surface.tsx`,
  `Popover.tsx`, `Select.tsx`) degrade correctly ahead of their individual
  cleanup in TASK-069. `--dur-fast`/`--dur`/`--dur-slow`/`--ease` motion
  tokens added for TASK-077.
- `docs/design-system/colors.md` — rewritten palette table, colour-budget
  note (~90/8/2), and a contrast table for both themes computed against the
  final token values (all pairs ≥4.5:1).
- `memory-bank/decisions.md` — new ADR-018, explicitly superseding ADR-010.
- `ARCHITECTURE.md` — Design System section now points at ADR-018 instead of
  the Deep Navy/Electric Blue/Emerald identity.

Not touched (deliberately, out of this task's scope): `docs/design-system/
ui-principles.md` still describes the old Deep Navy/Electric Blue/Emerald
identity — it wasn't in TASK-066's `scope`, so it's now stale pending a
follow-up; `--chart-*` and `--sidebar-*` tokens were left as literal OKLCH
values since neither is consumed by any component today (dead shadcn
boilerplate, confirmed via grep) and neither was part of ADR-010's palette
either. Dark mode is still not wired to any class — that's TASK-067.

### Feature: TASK-065 — Account deletion and data export

Status: **done** — green on typecheck/lint/test/build. Backend + settings-page
change, no Playwright loop (not a `ui`-labelled scope beyond one settings
section).

What shipped:

- `supabase/migrations/20260913120000_delete_own_account.sql` (new) —
  `public.delete_own_account()`, a `SECURITY DEFINER` plpgsql function
  (`set search_path = ''`) keyed on `auth.uid()`. Deletes the caller's rows
  from every `owner_id`-scoped table in FK-safe (children-before-parents)
  order — `application_status_events`, `applications`, `cv_documents`,
  `job_offers`, `posts`, `post_campaigns`, `ai_usage`, `subscriptions`,
  `profiles` — then `auth.users` itself, all in one transaction. `execute`
  revoked from `public`/`anon`, granted to `authenticated` only. Applied with
  `npm run db:push`; `npm run db:status` shows no drift.
- `src/features/account/services/delete-account.service.ts` (new) — resolves
  the owner via `supabase.auth.getUser()`, cancels any non-ended Stripe
  subscription via `getStripeClient()` + `subscriptionService.findByOwnerId`,
  calls `supabase.rpc('delete_own_account')` on the ordinary request client,
  then `supabase.auth.signOut()`. Never touches `createAdminClient()` — ADR-015's
  "exactly one request-path service-role caller" (the Stripe webhook) is
  unchanged.
- `src/app/api/account/route.ts` (new, `DELETE`) — requires
  `{ confirm: "DELETE" }` in the body, rate limited via the existing `'auth'`
  bucket in `src/shared/rate-limit` keyed on `ownerId`.
- `src/app/api/account/export/route.ts` (new, `GET`) — returns the signed-in
  owner's profile, offers, documents, applications, posts, status events and
  subscription as one JSON download, through the request client and RLS.
- `src/features/account/components/danger-zone.tsx` (new) — export button
  plus a destructive delete dialog requiring the literal text `DELETE` before
  the confirm button enables; redirects to `/sign-in` on success.
- `src/app/(app)/settings/page.tsx` — renders `<DangerZone />`.
- `docs/TESTING.md` — added the "Account deletion and data export" manual
  verification journey.
- `memory-bank/decisions.md`'s ADR-015 amendment for this task already
  existed (written during the TASK-062 split) and needed no changes — it
  already matched what shipped.

---

### Feature: TASK-062 — Launch hardening (rate limiting, security headers, admin-client guard)

Status: **done** — green on typecheck/lint/test/build. Backend/config-only,
no Playwright loop. Account deletion + data export were split to TASK-065 and
are NOT in this change.

What shipped:

- `src/shared/rate-limit/index.ts` (new) — one helper on `@upstash/ratelimit`
  + `@upstash/redis` (REST client, runs in the `src/proxy.ts` edge runtime).
  `classifyRateLimit(method, pathname)` is a pure, unit-tested function that
  maps a request to `'auth'` (POST `/sign-in` `/sign-up` `/forgot-password`),
  `'ai'` (the 12 AI POST routes incl. the dynamic `/api/offers/{id}/...`
  ones), or `null`. `/api/stripe/webhook` is explicitly never matched.
  `enforceRateLimit(kind, id)` returns `true`/`false`; sliding window
  10/60s for auth, 30/60s for ai. Reads `UPSTASH_REDIS_REST_URL` /
  `UPSTASH_REDIS_REST_TOKEN` straight from `process.env` (env module not in
  scope) — when either is unset the limiter is a no-op so local dev / CI /
  previews are unaffected.
- `src/proxy.ts` — after `getUser()`, calls `classifyRateLimit`; on a hit,
  keys per `user.id` when signed in else first `x-forwarded-for` IP, and
  returns `429` JSON when over the limit.
- `next.config.ts` — `async headers()` adds CSP + `X-Content-Type-Options`,
  `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, HSTS,
  `X-DNS-Prefetch-Control`. CSP keeps `'unsafe-inline'` for script/style (no
  nonce plumbing in this app), `'unsafe-eval'` dev-only; `connect-src` allows
  `*.supabase.co` + `wss://*.supabase.co`; `form-action` lists the Stripe
  Checkout/portal domains (they are top-level navigations so not strictly
  needed). `upgrade-insecure-requests` prod-only.
- `eslint.config.mjs` — `no-restricted-imports` on `src/**` (with the Stripe
  webhook sync service `ignore`d) forbidding `@/shared/db/admin` /
  `**/shared/db/admin`, so the ADR-015 comment in `src/shared/db/admin.ts` is
  now enforced. `scripts/` is outside the `files` glob so it stays allowed.
  Verified: a probe import from `src/app` fails lint with the ADR-015 message.
- `.env.example` — added the two `UPSTASH_REDIS_REST_*` vars (server-only,
  optional, disable-when-unset).
- `docs/TESTING.md` — new "Manual Verification Journeys" section: auth
  (incl. the 429), RLS isolation, subscription flow.
- `src/shared/rate-limit/index.test.ts` (new) — `classifyRateLimit` cases
  incl. webhook-exempt and non-POST/unrelated paths.

Deliberately not done: no per-route limiter wiring (centralised in the proxy,
which is the scoped file), no in-memory limiter, no self-hosted Redis, no
nonce-based strict CSP, no `src/shared/env.ts` change (out of scope — vars
read from `process.env` directly).

Validation:

- `npm run typecheck` — pass
- `npm run lint` — pass (1 pre-existing unrelated `no-img-element` warning)
- `npm run test` — 52 passed (4 new)
- `npm run build` — pass (`✓ Compiled successfully`)

### Feature: TASK-061 — Error monitoring and env var validation

Status: **done** — green on typecheck/lint/test/build (build run with CI's
two placeholder Supabase vars). Backend-only, no Playwright loop.

What shipped:

- `src/shared/env.ts` (new) — Zod-validated env. `clientSchema` (the two
  `NEXT_PUBLIC_` Supabase vars) + `serverSchema` (service-role key, AI keys,
  Stripe keys). `parseEnv(schema, source)` is a pure exported helper that
  throws one readable message naming every missing/invalid variable.
  `getClientEnv()` / `getServerEnv()` are memoized lazy accessors — nothing
  parses at import, so `next build` and the CI placeholder env keep working.
- `src/shared/db/client.ts`, `src/shared/db/admin.ts`, `src/proxy.ts` — the
  `process.env.X!` assertions replaced with `getClientEnv()` /
  `getServerEnv()`. No bare non-null assertion left in those three.
- `instrumentation.ts` (new) — `register()` calls `getClientEnv()` so a
  missing public var refuses to start with a message naming it (this hook
  does not run during `next build`). `onRequestError` POSTs unhandled server
  errors (name, message, stack, path, method) as JSON to
  `ERROR_MONITORING_WEBHOOK_URL`; no-op when unset; never throws into the
  request; 3s timeout. `console.error` diagnostics untouched. Reporter kept
  inline (no new file/folder) to stay within the task's scope list.
- `.env.example` — added `ERROR_MONITORING_WEBHOOK_URL` (server-only,
  optional) + a header note pointing at `src/shared/env.ts`.
- `docs/TECH_STACK.md` — "Environment Variables" and "Error Monitoring"
  subsections under "# Development Environment".
- `memory-bank/project-context.md` — "Current Stage" no longer says
  pre-implementation / no code shipped; points at ROADMAP "Where We Are".
- `memory-bank/ai-notes.md` — `shared/components/` → `src/shared/ui/`.
- `tests/smoke/unit/env.test.ts` (new) — `parseEnv` valid parse, missing-var
  message names each var, invalid value throws.

Server-side error hook only: capturing client errors would need an
`instrumentation-client.ts` or an `app/global-error.tsx`, neither in scope.
Error monitoring is a webhook POST, not an SDK — adding a vendor SDK is a
new dependency and out of scope. `next.config.ts` needed no change
(instrumentation is on by default in Next 16).

Validation:

- `npm run typecheck` — pass
- `npm run lint` — pass (1 pre-existing unrelated `no-img-element` warning)
- `npm run test` — 48 passed (3 new)
- `npm run build` — pass with `NEXT_PUBLIC_STORAGE_SUPABASE_SUPABASE_URL` /
  `_ANON_KEY` placeholders only (matches `.github/workflows/ci.yml`)

### Feature: TASK-060 — New-user onboarding flow

Status: **done** — green on typecheck/lint/test/build. Playwright
design-review loop not run (non-interactive session, no Playwright MCP
server available here) — needs a visual pass on `/onboarding` during review.

Review-round fixes (5 blocking findings from the deploy-loop):

- **Major — stale onboarding gate bounced the user back.** `completeOnboarding`
  now calls `revalidatePath('/', 'layout')` before `redirect('/dashboard')`
  so the shared `(app)` layout re-computes `needsOnboarding` instead of
  serving a cached `true` from the Router Cache.
- **Placeholder sentinel (findings 2 + 3).** `isPlaceholder` no longer
  overloads `summary === ''` (collided with a genuine CV parsing to an empty
  summary). The migration drops `NOT NULL` on `profiles.summary` and adds DB
  defaults for `skills`/`experience`; a pre-CV row now has `summary IS NULL`
  and `isPlaceholder` keys on that. `completeOnboarding` collapses to a single
  race-safe upsert (no more insert-then-update). The migration's placeholder
  insert only names `owner_id, onboarded_at` — no TS sentinel encoded in SQL.
- `updatePreferences` now applies the same `isPlaceholder` filter as
  `findUnique` (was returning a non-null `Profile` with an empty summary).
- **A11y.** `OnboardingStepper` gained `role="list"`/`role="listitem"`,
  `aria-current="step"` on the active item, and an `sr-only` state label so
  step state is not colour-only.
- `OnboardingGate` keeps its client `useEffect` redirect (server-side needs
  `proxy.ts`, out of scope) with a `ponytail:` comment naming the trade-off.

What shipped:

- `supabase/migrations/20260905110000_profile_onboarded_at.sql` — nullable
  `profiles.onboarded_at timestamptz`, backfilled to `created_at` for every
  existing row so current accounts never see onboarding.
- `src/entities/profile/types.ts` / `service.ts` — `onboardedAt` added to
  `Profile`/`profileSchema` and the row mapper. New
  `profileService.completeOnboarding(ownerId)`: additive, doesn't touch
  `upsert()`'s signature. Selects first — `update`s `onboarded_at` if a
  profile row exists, otherwise `insert`s a placeholder row (empty
  summary/skills/experience, all NOT NULL with no default) so skipping
  before any CV upload still persists `onboarded_at` instead of silently
  no-op'ing an UPDATE against zero rows.
- `src/features/onboarding/services/complete-onboarding.service.ts` — `'use
  server'` action (same pattern as `src/shared/auth/actions.ts`): calls
  `completeOnboarding` then `redirect('/dashboard')`. Used directly as a
  `<form action>` on both Skip and Finish.
- `src/features/onboarding/components/onboarding-stepper.tsx` —
  presentational progress indicator, no cross-feature imports.
- `src/features/onboarding/components/onboarding-gate.tsx` (new, not in the
  original scope list but required to make the layout redirect work) —
  client component; Next.js Server Components/layouts have no built-in way
  to read the current pathname (only middleware/`proxy.ts` does, which is
  out of this task's scope), so the `/onboarding` + `/settings` exemption is
  checked client-side via `usePathname()` and redirects with
  `router.replace()`. Returns `null` while redirecting, so there's no flash
  of gated content.
- `src/widgets/onboarding-panel/onboarding-panel.tsx` — cross-feature
  composition (`marketing`'s `PricingTable`, `cv`'s `CvUploadForm`,
  `job-offer`'s `AddOfferForm`) per ADR-008, driven by a `?step=` query
  param on `/onboarding` (Back/Next are plain `Link`s, no client state).
  Skip/Finish both submit the same server action.
- `src/app/(app)/onboarding/page.tsx` — reads/clamps `?step=`, renders
  `OnboardingPanel` inside `AppPageLayout`.
- `src/app/(app)/layout.tsx` — now also fetches the profile and wraps
  `children` in `OnboardingGate`.

Validation:

- `npm run typecheck` — pass
- `npm run lint` — pass (1 pre-existing unrelated `no-img-element` warning)
- `npm run test` — 42 passed (no new tests — this is routing/composition
  over already-tested services, no existing precedent for testing a page or
  a `usePathname` gate in this codebase)
- `npm run build` — pass; `/onboarding` compiles as a dynamic route

Not verified in this session: a live browser walk-through of a fresh signup
through all three steps (no Playwright MCP server in this environment).

### Feature: TASK-058 — Plan model and entitlement gate

Status: **done** — green on typecheck/lint/test/build. Backend-only, no
Playwright design-review loop needed.

What shipped:

- `src/shared/billing/plans.ts` (new) — `PlanId`, `Plan`, the `PLANS`
  constant (moved verbatim from `pricing-table.tsx`, which now imports it),
  `FREE_PLAN` and `getPlanById`. Single source of truth for tier
  name/price/AI-action allowance, ordered lowest-to-highest tier.
- `src/shared/billing/errors.ts` (new) — `EntitlementError` (carries `plan`,
  `limit`, `upgradePath`) and `toEntitlementErrorResponse` mapping it to a
  402 JSON body, modeled on `src/shared/ai/errors.ts`'s `toAiErrorResponse`.
- `src/shared/billing/entitlements.ts` (new) — `getPlanForOwner(ownerId)`
  (active/trialing → that plan, everything else including no row → free, via
  `subscriptionService.findByOwnerId`), `requirePlan(ownerId, planId)`
  (throws `EntitlementError` with `limit: 0` if the owner's plan index is
  below the required plan's), `assertWithinLimit(used, plan)` (throws when
  `used >= plan.aiActionsPerMonth`; does not count usage itself — TASK-059).
- `src/features/marketing/components/pricing-table.tsx` — `PlanId`/`Plan`/
  `PLANS` now imported from `@/shared/billing/plans` instead of being
  defined locally; no behaviour change.
- `docs/API_GUIDE.md` — new "Entitlement Error Handling" section next to the
  existing AI-routes error section, documenting the 402 body shape.
- `tests/smoke/unit/entitlements.test.ts` (new) — covers `getPlanForOwner`
  for every `SubscriptionStatus` value, `requirePlan`'s throw/pass paths, and
  `assertWithinLimit`'s boundary.

Not done in this task (explicitly out of scope): no route wires these
helpers in yet (no existing feature is gated) — that starts with TASK-059's
AI quota.

Validation:

- `npm run typecheck` — pass
- `npm run lint` — pass (1 pre-existing unrelated `no-img-element` warning)
- `npm run test` — 40 passed (13 new)
- `npm run build` — pass

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
