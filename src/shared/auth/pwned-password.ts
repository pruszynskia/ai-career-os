import { createHash } from 'node:crypto';

// HIBP range API (k-anonymity): only the first 5 hex chars of the SHA-1 leave
// the server, never the password. Free, no key.
const HIBP_RANGE_URL = 'https://api.pwnedpasswords.com/range/';

// ponytail: fails open (returns false) if HIBP is down or slow - sign-up must
// not depend on a third party. Fail closed if breached-password blocking ever
// becomes a hard requirement.
export async function isPasswordBreached(password: string): Promise<boolean> {
  const sha1 = createHash('sha1').update(password).digest('hex').toUpperCase();
  const prefix = sha1.slice(0, 5);
  const suffix = sha1.slice(5);

  try {
    const res = await fetch(HIBP_RANGE_URL + prefix, {
      headers: { 'Add-Padding': 'true' },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return false;
    // Lines are "SUFFIX:COUNT"; padded entries have count 0 and are decoys.
    return (await res.text()).split('\n').some((line) => {
      const [hash, count] = line.trim().split(':');
      return hash === suffix && Number(count) > 0;
    });
  } catch (error) {
    console.error('[auth] HIBP check failed', error);
    return false;
  }
}
