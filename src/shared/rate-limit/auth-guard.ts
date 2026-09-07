import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { clientIp, enforceRateLimit } from './index';

/**
 * Rate limit guard for the auth Server Functions (sign-in, sign-up,
 * forgot-password, Google OAuth start).
 *
 * This lives in the actions rather than in src/proxy.ts because a Server
 * Function is a POST to the page's own path, not a separate route: a proxy
 * that answers it with a redirect or a bare 429 breaks the action client
 * instead of showing the user anything (vercel/next.js#65394). Next's own
 * proxy docs say the same — verify inside each Server Function rather than
 * relying on Proxy alone.
 *
 * Over the limit, this redirects to `redirectTo` with `?error=rate_limit`,
 * which is exactly how these actions already report failure, so the page
 * renders a message instead of tripping the error boundary.
 */
export async function guardAuthRateLimit(redirectTo: string): Promise<void> {
  // No session here by definition, so the key is the caller's IP. Unknown IP
  // means no bucket to charge — see clientIp().
  const ip = clientIp(await headers());
  if (!ip) return;
  const { ok } = await enforceRateLimit('auth', ip);
  if (!ok) redirect(`${redirectTo}?error=rate_limit`);
}
