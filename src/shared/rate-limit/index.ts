import { Ratelimit, type Duration } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Our own request-rate limiting for the surfaces that accept unlimited
// attempts today: the auth pages and the AI endpoints. Storage is Upstash
// Redis over its REST client. Configure with UPSTASH_REDIS_REST_URL /
// UPSTASH_REDIS_REST_TOKEN; unset means "not enforced" (local dev, CI).
//
// Two call sites, because they need different enforcement points:
//   - 'ai'   → route handlers, limited in src/proxy.ts, which answers 429.
//   - 'auth' → sign-in/sign-up/forgot-password submit through Server
//     Functions, which post to the *page* path. A proxy that answers those
//     with a redirect or a 429 breaks the action client (vercel/next.js#65394
//     — the action fetch follows the redirect and gets HTML back), so the
//     auth limit is enforced inside the actions themselves via
//     ./auth-guard, which Next docs call the correct layer anyway:
//     "Always verify authentication and authorization inside each Server
//     Function rather than relying on Proxy alone."

export type RateLimitKind = 'auth' | 'ai';

const RULES: Record<RateLimitKind, { tokens: number; window: Duration }> = {
  // Sign-in / sign-up / forgot-password: a real attempt is one request; this
  // still allows a few fat-fingered retries before a 429.
  auth: { tokens: 10, window: '60 s' },
  // AI endpoints are expensive and metered; 30/min per owner is generous for
  // interactive use and stops a runaway loop.
  ai: { tokens: 30, window: '60 s' },
};

const AI_PATHS = new Set([
  '/api/offers',
  '/api/cv/optimize',
  '/api/cv/upload',
  '/api/cover-letter/optimize',
  '/api/cover-letter/upload',
  '/api/posts/plan',
  '/api/posts/generate',
  '/api/posts/campaigns',
]);

const AI_OFFER_SUFFIXES = [
  '/match',
  '/tailor-cv',
  '/cover-letter',
  '/recruiter-message',
];

/**
 * Which limiter, if any, src/proxy.ts applies to this request. Pure and
 * unit-tested — no Redis. Never matches `/api/stripe/webhook` (Stripe retries
 * on its own schedule) and never matches the auth pages, whose Server
 * Function submits are guarded in ./auth-guard instead.
 */
export function classifyRateLimit(
  method: string,
  pathname: string,
): RateLimitKind | null {
  if (method !== 'POST') return null;
  if (pathname === '/api/stripe/webhook') return null;
  if (AI_PATHS.has(pathname)) return 'ai';
  if (
    pathname.startsWith('/api/offers/') &&
    AI_OFFER_SUFFIXES.some((suffix) => pathname.endsWith(suffix))
  ) {
    return 'ai';
  }
  return null;
}

// Read Upstash config lazily on first use, not at module scope: on a runtime
// platform where the vars are injected per-request (not at build) a module-eval
// read can miss them. Local dev, CI and preview builds run without Upstash and
// must not start throttling — but a production deploy with no config is almost
// certainly a mistake, so say so loudly once.
let redisInstance: Redis | null = null;
let warnedMissing = false;

function getRedis(): Redis | null {
  // Only a *successful* client is cached. Caching the miss would freeze the
  // unconfigured state for the life of the process and defeat the lazy read.
  if (redisInstance) return redisInstance;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    if (!warnedMissing) {
      warnedMissing = true;
      const message =
        '[rate-limit] UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are ' +
        'not set — auth and AI endpoints are NOT rate limited.';
      if (process.env.NODE_ENV === 'production') console.error(message);
      else console.warn(message);
    }
    return null;
  }
  redisInstance = new Redis({ url, token });
  return redisInstance;
}

/**
 * The client IP as the hosting platform saw it, or null when it cannot be
 * determined. Prefer `x-real-ip`: the first `x-forwarded-for` hop is
 * client-supplied and can be rotated to dodge the limit.
 *
 * Null means "do not limit". Bucketing every header-less request under one
 * placeholder IP would let a single caller exhaust a bucket shared by
 * everyone else in that state.
 */
export function clientIp(headers: Headers): string | null {
  const real = headers.get('x-real-ip')?.trim();
  if (real) return real;
  const forwarded = headers.get('x-forwarded-for')?.split(',', 1)[0]?.trim();
  return forwarded || null;
}

let warnedSkipped = false;

/**
 * One-time warning for when a limiter check is skipped because the request
 * carried no usable client IP. Expected locally; in production it means the
 * platform is not forwarding `x-real-ip` / `x-forwarded-for` and the limit is
 * effectively off, so this must not pass silently. Paired with getRedis()'s
 * "not configured" warning, these are the only two ways limiting silently
 * no-ops.
 */
export function warnRateLimitSkipped(context: string): void {
  if (warnedSkipped) return;
  warnedSkipped = true;
  const message =
    `[rate-limit] ${context}: request has no client IP, so the check was ` +
    'skipped. Expected without a proxy in front; in production it means ' +
    'x-real-ip / x-forwarded-for are not being forwarded.';
  if (process.env.NODE_ENV === 'production') console.error(message);
  else console.warn(message);
}

const limiters = new Map<RateLimitKind, Ratelimit>();

function limiterFor(kind: RateLimitKind): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;
  const cached = limiters.get(kind);
  if (cached) return cached;
  const { tokens, window } = RULES[kind];
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(tokens, window),
    prefix: `ratelimit:${kind}`,
  });
  limiters.set(kind, limiter);
  return limiter;
}

export interface RateLimitResult {
  /** True when the caller may proceed. */
  ok: boolean;
  /** Seconds to wait before retrying. 0 when allowed or not enforced. */
  retryAfter: number;
}

/**
 * Checks `identifier` against the limiter for `kind`.
 *
 * Fails open: when Upstash is unconfigured *or* the limiter call throws
 * (rotated token, 401/5xx, free-tier command cap, DNS) the request is allowed
 * through. A rate-limit backend outage must not take auth and the AI endpoints
 * down with it.
 */
export async function enforceRateLimit(
  kind: RateLimitKind,
  identifier: string,
): Promise<RateLimitResult> {
  const limiter = limiterFor(kind);
  if (!limiter) return { ok: true, retryAfter: 0 };
  try {
    const { success, reset } = await limiter.limit(identifier);
    if (success) return { ok: true, retryAfter: 0 };
    return {
      ok: false,
      retryAfter: Math.max(1, Math.ceil((reset - Date.now()) / 1000)),
    };
  } catch (error) {
    console.error('[rate-limit] limiter unavailable, allowing request', error);
    return { ok: true, retryAfter: 0 };
  }
}
