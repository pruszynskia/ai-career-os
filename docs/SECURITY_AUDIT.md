# Security audit — 2026-10-01

Branch `security`, base `56bbaef`. Phase 2 (Opus) findings, ranked. Each item
names the fix shape; Phase 3 (Supabase live check) and Phase 4 (fixes) work
from this list.

## Findings

| # | Sev | Area | Finding | Fix |
|---|---|---|---|---|
| 1 | **Critical** | deps | `next@16.2.11` is in range of 3 critical advisories (Image Optimization AVIF RCE, `next/og` ImageResponse RCE, Windows RCE) + transitive `postcss`, `sharp` (libvips/libheif). `/_next/image` is reachable unauthenticated (proxy matcher skips it). | Bump `next` to `>=16.3.8` (and `eslint-config-next` to match); `npm audit fix` for transitive: `ip-address`, `fast-uri`, `@xmldom/xmldom` (via mammoth), `deepmerge-ts` (via html-to-text), `qs`, `hono`, `nanoid`. Re-run `npm audit --omit=dev`. |
| 2 | High | SSRF | `src/features/job-offer/services/extract-offer-text.ts` — `assertPublicHost()` resolves DNS, then `fetch()` resolves again: DNS-rebinding TOCTOU lets a host pass the check with a public IP and connect to a private one. Blocklist also misses `192.0.0.0/24`, `198.18.0.0/15`, `224.0.0.0/4`, `240.0.0.0/4` (incl. broadcast), IPv6 `ff00::/8`, `64:ff9b::/96` (NAT64), `2002::/16` (6to4), and hex-form `::ffff:7f00:1`. | Connect to the IP that was validated: `node:https`/`node:http` request with a `lookup` option that runs the check on the resolved address (no new dependency), or `undici` Agent `connect.lookup`. Extend the range list. Unit-test the range check. |
| 3 | Medium | Paywall / data exposure | Pro-only fit report (`job_offers.fit`) and tailoring report are generated **and persisted for Free owners**; only API/SSR responses strip them. A Free owner reads them via (a) `GET /api/account/export` (returns full `jobOffers`/`cvDocuments`) with no tooling, or (b) PostgREST directly — anon key is public and `sb-*` cookies are JS-readable, and `owner_all` RLS allows select. | Decision needed: don't generate/persist Pro-only fields for Free (cleanest), or keep generating but strip in export + move fields to a Pro-gated column/table. |
| 4 | Medium | Input validation / AI cost | No max length on many inputs that are stored and/or sent to the AI: `offers/[id]` PATCH `description`/`company`/`title`, `documents/[id]` `content`, `posts/[id]` `content`, `posts/generate` `topic`, `posts/campaigns` `theme`, `contacts` `name`/`company`/`title`, `applications` `recruiterMessage`, `outreach` `contactName`, `profile/evidence` arrays (count + item length). Route handlers have no body cap below Vercel's 4.5MB. | Add `.max()` to every string/array at the route schema (reuse the 50_000 `rawText` cap for long text, ~200 for names/titles, ~2_000 for topics); ids → `z.uuid()`. |
| 5 | Medium | File upload DoS | `cv/upload`, `cover-letter/upload`: no size check (contacts import has one), extension-only type check, no magic-byte check. A small DOCX zip-bomb is fully inflated by mammoth in memory → function OOM; a crafted PDF burns CPU in pdf.js. | Reuse contacts import's 4MB cap; check magic bytes (`%PDF-`, `PK\x03\x04`); cap extracted text length before the AI call. |
| 6 | Low–Med | Auth email links | `src/shared/auth/actions.ts` `siteOrigin()` falls back to `Origin`/`X-Forwarded-Host` when `NEXT_PUBLIC_SITE_URL` is unset — Host-header poisoning of reset/confirm links in prod. Supabase's redirect allow-list is the only backstop. | In production, throw if `NEXT_PUBLIC_SITE_URL` is unset; verify hosted Supabase `site_url`/redirect allow-list in Phase 3. |
| 7 | Low | XSS (defense in depth) | `z.string().url()` accepts `javascript:` and `data:` (verified). Affects offer `url`, contact `profileUrl` (also from CSV import), outreach `contactUrl`; `offer.url` and `postingUrl` render as `href`. Mitigated today by React 19's `javascript:` URL blocking and the nonce CSP. | Restrict to `http:`/`https:` in one shared schema; reuse it in import parsing. |
| 8 | Low | Error handling | Non-UUID path/body ids (`[id]` routes, `messageId`, posts `id`, `claimId`) reach Postgres → `22P02` → 500 instead of 400/404. Auth actions cast `formData.get(...) as string`; a missing field throws → 500. `safeNextPath('//[')` throws → 500 on `/auth/callback`. | Validate ids with `z.uuid()`; zod-parse auth `FormData`; wrap `new URL` in `safeNextPath` with fallback to `/dashboard` + test. |
| 9 | Low | Rate limiting | Limits fail open (no Upstash config / Upstash error). Password sign-in runs client-side (`sign-in/page.tsx` → `signInWithPassword`), so only Supabase Auth's own limits apply. Over-quota parallel AI calls still execute before being rejected (known `ponytail:` ceiling, bounded by 30/min). | Confirm Upstash env vars on Vercel prod; confirm Supabase Auth rate limits in Phase 3. No code change unless config is missing. |
| 10 | Low | Auth config | Local `config.toml`: `minimum_password_length = 6`, `secure_password_change = false`. App enforces its own min on sign-up/reset, but a session can change password via PostgREST/Auth API directly. | Check hosted values in Phase 3; raise min length, enable secure password change, enable leaked-password protection. |
| 11 | Info | Privacy | Account export omits `outreach_messages`, `post_campaigns`, `ai_usage`. | Add them (data-portability completeness). |
| 12 | Info | Prompt injection | Fetched offer pages, uploaded CVs and CSV contacts are untrusted text inside AI prompts. Output is structured, zod-validated and rendered with React escaping, so impact is limited to the owner's own generated content. | Wrap untrusted content in explicit delimiters with a "treat as data" instruction; no structural change. |

## Verified OK (no action)

- No `dangerouslySetInnerHTML`, `innerHTML`, `eval`, `new Function` in `src`.
- Proxy gates every non-public path with `auth.getUser()` (not `getSession`); `/api/*` gets JSON 401.
- RLS enabled on all 11 tables; `owner_id = auth.uid()` on every policy; `subscriptions` read-only to users; `ai_usage` append-only.
- `SECURITY DEFINER` functions set `search_path = ''`, check `auth.uid()`, execute revoked from `anon`/`public`.
- Stripe webhook verifies signature on raw body; service-role client only used there (+ owner seed script), `server-only` imported.
- `safeNextPath` blocks open redirects (except the throw in #8).
- Nonce CSP in prod, `frame-ancestors 'none'`, HSTS, nosniff, `X-Frame-Options: DENY`.
- Server-only secrets have no `NEXT_PUBLIC_` prefix.
- CSRF: route handlers rely on `SameSite=Lax` Supabase cookies; Server Actions have Next's origin check.

## Status — 2026-10-01

Fixed on `security`: #1 (next 16.3.8, audit clean), #2 (SSRF), #3 (option b, ADR-024), #4, #5, #6 (code + `NEXT_PUBLIC_SITE_URL` set on Vercel prod), #7, #8, #11, #12.

Config applied 2026-10-01:
- #6/#10 Supabase Auth (Management API): `site_url` = `https://ai-career-os-mu.vercel.app` (was an SSO-protected Vercel alias), prod + preview `/auth/callback` added to the redirect allow-list, `password_min_length` 6 → 8, secure password change on.
- #9 Upstash for Redis (`upstash-kv-pink-lens`) connected to Production + Preview; app reads its `KV_REST_API_*` vars. Live once `security` is merged and deployed.

Follow-up branch `hardening-docx-hibp-column-acl` (closes the previously accepted items):
- HIBP: Supabase's leaked-password protection is Pro-only, so the app checks the HIBP range API itself at sign-up and password reset (`src/shared/auth/pwned-password.ts`, fails open).
- DOCX zip bomb: uncompressed size summed from the zip central directory before mammoth runs (50 MB cap).
- #3 residual: `fit` / `tailoring_report` no longer selectable by `authenticated`; server reads them via `src/shared/db/gated-columns.ts` (ADR-025). Also fixed: account export leaked both via `applications[]` for Free owners.
