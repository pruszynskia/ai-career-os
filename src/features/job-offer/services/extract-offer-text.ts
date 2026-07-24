import 'server-only';

import dns from 'node:dns/promises';
import net from 'node:net';

import { convert } from 'html-to-text';

const FETCH_TIMEOUT_MS = 10_000;
const MAX_RESPONSE_BYTES = 5 * 1024 * 1024;
const MAX_REDIRECTS = 5;

export class OfferFetchError extends Error {
  constructor() {
    super(
      'Failed to fetch or parse the offer URL. Paste the offer text instead.',
    );
    this.name = 'OfferFetchError';
  }
}

// ponytail: covers the common private/loopback/link-local ranges (including
// the 169.254.169.254 cloud metadata address); not an exhaustive IANA
// special-registry check. Revisit if this ever fetches on behalf of
// untrusted multi-tenant users (ADR-005).
function isPrivateOrReservedIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number);
    return (
      a === 10 ||
      a === 127 ||
      a === 0 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 100 && b >= 64 && b <= 127)
    );
  }

  const normalized = ip.toLowerCase();
  return (
    normalized === '::1' ||
    normalized.startsWith('fc') ||
    normalized.startsWith('fd') ||
    normalized.startsWith('fe80')
  );
}

async function assertPublicHost(hostname: string): Promise<void> {
  let addresses: string[];
  try {
    addresses = (await dns.lookup(hostname, { all: true })).map(
      (entry) => entry.address,
    );
  } catch {
    throw new OfferFetchError();
  }

  if (addresses.length === 0 || addresses.some(isPrivateOrReservedIp)) {
    throw new OfferFetchError();
  }
}

async function readWithSizeLimit(response: Response): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) return response.text();

  const chunks: Uint8Array[] = [];
  let total = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;

    total += value.byteLength;
    if (total > MAX_RESPONSE_BYTES) {
      await reader.cancel();
      throw new OfferFetchError();
    }
    chunks.push(value);
  }

  return Buffer.concat(chunks).toString('utf-8');
}

export async function fetchAndStripUrl(url: string): Promise<string> {
  let currentUrl = url;

  for (let redirectCount = 0; ; redirectCount++) {
    if (redirectCount > MAX_REDIRECTS) throw new OfferFetchError();

    let parsed: URL;
    try {
      parsed = new URL(currentUrl);
    } catch {
      throw new OfferFetchError();
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new OfferFetchError();
    }

    await assertPublicHost(parsed.hostname);

    let response: Response;
    try {
      response = await fetch(currentUrl, {
        redirect: 'manual',
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
    } catch {
      throw new OfferFetchError();
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location) throw new OfferFetchError();
      currentUrl = new URL(location, currentUrl).toString();
      continue;
    }

    if (!response.ok) throw new OfferFetchError();

    const html = await readWithSizeLimit(response);
    return convert(html, { wordwrap: false }).trim();
  }
}
