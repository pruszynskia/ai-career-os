# Current Tasks

## Current Sprint

### Feature: TASK-054 — Google OAuth sign-in

Status: Implemented; gate green. Live OAuth round-trip not run
(non-interactive session, and Google provider not yet enabled in the Supabase
dashboard) — needs manual end-to-end verification during review.

Additive on ADR-009 Supabase Auth per its "OAuth providers are a dashboard
toggle" note. No new auth library, no users/accounts table, no second callback
route. Provider config is entirely dashboard/console-side.

What shipped:
- `src/shared/auth/actions.ts`: added `signInWithGoogle` server action —
  `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo:
  `${siteOrigin()}/auth/callback` } })`, redirects to `data.url`;
  `/sign-in?error=oauth` on error or missing url. Reuses the existing
  `siteOrigin()` helper.
- `src/app/sign-in/page.tsx` and `src/app/sign-up/page.tsx`: added an "or"
  divider (two `Divider` primitives + text) and a `<form action=
  {signInWithGoogle}>` wrapping an `outline` `Button` "Continue with Google".
  Sign-in error copy gained an `error === 'oauth'` branch.
- `src/app/auth/callback/route.ts`: unchanged — its existing PKCE `code` →
  `exchangeCodeForSession` branch already handles the OAuth callback, `next`
  defaults to `/dashboard`.
- `docs/TECH_STACK.md`: Authentication section now says "email/password plus
  Google OAuth", documents the `signInWithGoogle` flow, and records the
  dashboard/console config as load-bearing: Supabase Authentication →
  Providers → Google (client id + secret pasted there, never in `.env*` or
  `NEXT_PUBLIC_`), Google Cloud console authorized redirect URI
  `https://<project-ref>.supabase.co/auth/v1/callback`, and the app's own
  `/auth/callback` still in Supabase's Redirect URLs allowlist.

Validation:
- `npm run typecheck` — pass
- `npm run lint` — pass (1 pre-existing unrelated `no-img-element` warning)
- `npm run test` — 23 passed
- `npm run build` — pass; `/sign-in`, `/sign-up`, `/auth/callback` in the
  route manifest
- Playwright design-review loop / live OAuth round-trip not run
  (non-interactive session) — needs manual verification with the Google
  provider enabled and data-isolation check between two accounts during
  review.
