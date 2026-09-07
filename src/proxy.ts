import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

import { getClientEnv } from '@/shared/env';
import {
  classifyRateLimit,
  clientIp,
  enforceRateLimit,
  warnRateLimitSkipped,
} from '@/shared/rate-limit';
import { SECURITY_HEADERS } from '@/shared/security-headers';

/**
 * Per-request Content-Security-Policy. Built here rather than in next.config.ts
 * so production can bind script execution to a fresh nonce instead of the
 * blanket `'unsafe-inline'` (which gives the CSP almost no XSS value). Next.js
 * reads this off the request headers and stamps the nonce onto its own inline
 * scripts. Dev keeps `'unsafe-inline'` so the HMR/runtime scripts still load.
 */
function buildCsp(nonce: string): string {
  const isDev = process.env.NODE_ENV !== 'production';
  const scriptSrc = isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : `script-src 'self' 'nonce-${nonce}'`;
  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    // Google sign-in: before hydration the button is a native form POST, and
    // the 303 goes to Supabase's /auth/v1/authorize, which then bounces to
    // accounts.google.com — both hops need to be allowed here.
    "form-action 'self' https://*.supabase.co https://accounts.google.com https://checkout.stripe.com https://billing.stripe.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "object-src 'none'",
    ...(isDev ? [] : ['upgrade-insecure-requests']),
  ].join('; ');
}

function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}

// Reachable without a session; every other path redirects to /sign-in.
const PUBLIC_PATHS = [
  '/',
  '/pricing',
  '/sign-in',
  '/sign-up',
  '/forgot-password',
  '/reset-password',
  '/auth/callback',
  '/api/stripe/webhook',
];

export async function proxy(request: NextRequest) {
  const nonce = generateNonce();
  const csp = buildCsp(nonce);

  // Rebuild from the *current* request state every time: Supabase's `setAll`
  // calls `request.cookies.set()`, which mutates `request.headers`, so a
  // snapshot taken before the session refresh would forward the stale Cookie
  // header downstream and desync the browser/server sessions.
  const buildRequestHeaders = (): Headers => {
    const headers = new Headers(request.headers);
    headers.set('x-nonce', nonce);
    headers.set('content-security-policy', csp);
    return headers;
  };

  // Every response leaving the proxy carries the CSP and the static security
  // headers — not just the pass-through one, but also the /sign-in gate
  // redirect and the 429s, which next.config.ts `headers()` never reaches — and
  // any `sb-*` cookies Supabase's session refresh wrote onto `response`.
  // Dropping those on a redirect/429 would desync the browser session and
  // silently sign the user out on the next request.
  const finalize = (res: NextResponse): NextResponse => {
    res.headers.set('content-security-policy', csp);
    for (const [key, value] of SECURITY_HEADERS) res.headers.set(key, value);
    if (res !== response) {
      response.cookies.getAll().forEach((cookie) => res.cookies.set(cookie));
    }
    return res;
  };

  let response = NextResponse.next({
    request: { headers: buildRequestHeaders() },
  });
  const env = getClientEnv();

  const supabase = createServerClient(
    env.NEXT_PUBLIC_STORAGE_SUPABASE_SUPABASE_URL,
    env.NEXT_PUBLIC_STORAGE_SUPABASE_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({
            request: { headers: buildRequestHeaders() },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Route handlers only. The auth pages submit through Server Functions, which
  // post to the page path; a redirect or 429 answered here breaks the action
  // client rather than reaching the user (vercel/next.js#65394), so that limit
  // lives in src/shared/rate-limit/auth-guard.ts instead.
  const rateLimitKind = classifyRateLimit(
    request.method,
    request.nextUrl.pathname,
  );
  if (rateLimitKind) {
    // Key per owner when there is a session, per client IP otherwise. A null
    // identifier means there is no safe bucket to charge — see clientIp() —
    // so the check is skipped, loudly in production where it should not happen.
    const identifier = user?.id ?? clientIp(request.headers);
    if (!identifier) warnRateLimitSkipped('AI endpoint');
    const { ok, retryAfter } = identifier
      ? await enforceRateLimit(rateLimitKind, identifier)
      : { ok: true, retryAfter: 0 };
    if (!ok) {
      return finalize(
        NextResponse.json(
          { message: 'Too many requests. Please wait a moment and try again.' },
          { status: 429, headers: { 'Retry-After': String(retryAfter) } },
        ),
      );
    }
  }

  const isSignedIn = Boolean(user);
  const isPublicPath = PUBLIC_PATHS.includes(request.nextUrl.pathname);

  if (!isSignedIn && !isPublicPath) {
    return finalize(NextResponse.redirect(new URL('/sign-in', request.url)));
  }

  return finalize(response);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
