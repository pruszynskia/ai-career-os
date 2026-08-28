# Current Tasks

## Current Sprint

### Feature: TASK-053 — Self-serve sign-up, email verification and password reset

Status:

Implemented + round-2 recovery-link fix applied; gate green. Live email
round-trip not yet run — blocked on Supabase built-in email rate limit
(~2/hour project-wide); needs custom SMTP configured first. Deferred by
decision, to be verified alongside a later task.

Opens the Monetization Milestone. Additive on ADR-009 Supabase Auth — no new
auth library, no users/accounts table, `getOwnerId()` and every `owner_all`
RLS policy untouched. `scripts/create-owner-user.ts` left in place.

What shipped:
- `src/shared/auth/actions.ts`: added `signUp`, `requestPasswordReset`,
  `updatePassword` server actions alongside `signOut`. `siteOrigin()` helper
  derives the absolute redirect base from request headers
  (`origin` → `x-forwarded-host`/`host`). Forgot-password always redirects to
  `?sent=1` (no account-existence disclosure).
- `src/app/sign-up/page.tsx`: server-action form mirroring `sign-in/page.tsx`,
  calls `signUp` (which sets `emailRedirectTo` → `/auth/callback`).
  `?sent=1` shows "check your email", `?error=1` shows failure. Link to
  `/sign-in`.
- `src/app/forgot-password/page.tsx`: `requestPasswordReset` form,
  `redirectTo` → `/auth/callback?next=/reset-password`.
- `src/app/reset-password/page.tsx`: `updatePassword` form (`auth.updateUser`),
  `minLength={8}`, redirects to `/` on success.
- `src/app/auth/callback/route.ts`: GET, `exchangeCodeForSession(code)`, then
  redirect to `next` param (`/dashboard` default, `/reset-password` for
  recovery links); `/sign-in?error=1` on failure.
- `src/proxy.ts`: replaced the single `isSignInPage` equality check with a
  `PUBLIC_PATHS` list (`/sign-in`, `/sign-up`, `/forgot-password`,
  `/reset-password`, `/auth/callback`). Redirect behaviour for every other
  path unchanged.
- `src/app/sign-in/page.tsx`: added "Forgot password?" and "Sign up" links
  (no change to the existing inline `authenticate` action).
- `docs/PRODUCT.md`: Vision, Target Users, Secondary Users and the
  "Out of Scope" entry reframed from single-user to multi-user self-serve;
  the postponed item is now OAuth providers (TASK-054) only.
- `docs/TECH_STACK.md`: Authentication section describes self-serve
  registration + reset, notes `db:seed` is no longer the only path, fixes the
  stale `src/middleware.ts` reference to `src/proxy.ts`.

Review fixes (round 1):
- `src/app/auth/callback/route.ts`: exported `safeNextPath()` — `next` must be
  a same-origin absolute path (`/^\/(?!\/|\\)/`), else `/dashboard`. Closes the
  open redirect (`https://evil.com`, `//evil.com`, `/\evil.com`).
- `src/shared/auth/actions.ts`: `siteOrigin()` now prefers
  `NEXT_PUBLIC_SITE_URL` over request headers (host-header poisoning →
  reset-token theft) and falls back to `http://` for localhost. Key added to
  `.env.example`; `docs/TECH_STACK.md` notes the `/auth/callback` allowlist
  requirement.
- Reverted 8 out-of-scope Prettier-only reflows (`git checkout --`).
- `tests/smoke/unit/auth-redirect.test.ts`: covers `safeNextPath`.

Review fixes (round 2 — live test showed the recovery link never reached
`/reset-password`):
- Root cause (Supabase `auth_logs`, project `wqaibeijmnubvplydbzg`):
  `/auth/v1/verify` 303'd with `redirect_to` = the bare Site URL. Supabase
  discards a `redirectTo` that is not an exact match in the Redirect URLs
  allowlist and substitutes the Site URL, so `/auth/callback` was never hit.
  Secondary: `/auth/callback` only handled the PKCE `code`, which needs the
  code-verifier cookie and so breaks whenever the email is opened on another
  device.
- `src/app/auth/callback/route.ts`: added a `token_hash` + `type`
  (`verifyOtp`) branch ahead of the `code` branch — stateless, cross-device.
  `next` defaults by type (`recovery` → `/reset-password`, else `/dashboard`).
  Failure now routes `recovery` → `/forgot-password?error=expired`, else
  `/sign-in?error=link` (was always `/sign-in?error=1`). `code` /
  `exchangeCodeForSession` branch kept for TASK-054.
- `src/shared/auth/actions.ts`: `requestPasswordReset` `redirectTo` dropped
  its `?next=` query string (now an exact allowlist match; `next` comes from
  the email template). `updatePassword` compares `password`/`confirmPassword`
  → `?error=mismatch` on mismatch; success now `/dashboard` (verifyOtp already
  signed them in).
- `src/app/reset-password/page.tsx`: `getUser()` guard → redirect to
  `/forgot-password?error=expired` with no session. Added Confirm-password
  field, `autoComplete="new-password"` on both, error copy keyed off
  `?error=` (`mismatch`).
- `src/app/forgot-password/page.tsx`: renders `?error=expired` message.
- `src/app/sign-in/page.tsx`: `?error=link` vs `?error=1` copy.
- `docs/TECH_STACK.md`: exact Redirect URL entries + the two email-template
  link strings recorded as load-bearing config.
- Blocked on Andrzej before live verification: 2 Redirect URL allowlist
  entries + 2 email-template rewrites in the Supabase dashboard, and custom
  SMTP (built-in sender is capped ~2 emails/hour project-wide — hit `429:
  email rate limit exceeded` on `/recover` during testing; server action
  swallows it and still shows `?sent=1`). See `ai-notes.md` Lessons Learned.

Known gap (no code change): a signed-in user can change their password at
`/reset-password` without re-entering the current one. Mitigate via Supabase
Auth "Secure password change" (require recent login / reauthentication).

Validation:
- `npm run typecheck` — pass
- `npm run lint` — pass (1 pre-existing unrelated `no-img-element` warning)
- `npm run build` — pass; `/sign-up`, `/forgot-password`, `/reset-password`,
  `/auth/callback` all in the route manifest
- `npx vitest run` — 21 passed
- Playwright design-review loop / live email round-trips not run
  (non-interactive session) — needs manual end-to-end verification against a
  real Supabase project during review.
