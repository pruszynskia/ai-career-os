import 'server-only';

import dns from 'node:dns';
import http, { type IncomingMessage } from 'node:http';
import https from 'node:https';
import net, { type LookupFunction } from 'node:net';

import { convert } from 'html-to-text';

const FETCH_TIMEOUT_MS = 10_000;
const MAX_RESPONSE_BYTES = 5 * 1024 * 1024;
const MAX_REDIRECTS = 5;
// Matches the rawText cap on the pasted-text path (PIPE-12,
// src/app/api/offers/route.ts) - html-to-text output from a page under the
// 5MB response cap can still be far larger than what's useful to the AI.
const MAX_TEXT_CHARS = 50_000;

export class OfferFetchError extends Error {
  constructor() {
    super(
      'Failed to fetch or parse the offer URL. Paste the offer text instead.',
    );
    this.name = 'OfferFetchError';
  }
}

// IANA special-purpose ranges that are not globally reachable. BlockList
// applies the IPv4 rules to IPv4-mapped IPv6 addresses in any notation
// ("::ffff:127.0.0.1" and "::ffff:7f00:1" alike), which is what PIPE-11's
// regex unwrap only half covered.
const blockedRanges = new net.BlockList();
for (const [prefix, bits] of [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.0.2.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['198.51.100.0', 24],
  ['203.0.113.0', 24],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
] as const) {
  blockedRanges.addSubnet(prefix, bits, 'ipv4');
}
for (const [prefix, bits] of [
  ['::', 96], // unspecified, loopback, deprecated IPv4-compatible
  ['64:ff9b::', 96], // NAT64
  ['64:ff9b:1::', 48],
  ['100::', 64],
  ['2001::', 23], // Teredo and other IETF protocol assignments
  ['2001:db8::', 32],
  ['2002::', 16], // 6to4
  ['fc00::', 7],
  ['fe80::', 10],
  ['ff00::', 8],
] as const) {
  blockedRanges.addSubnet(prefix, bits, 'ipv6');
}

export function isPrivateOrReservedIp(ip: string): boolean {
  const family = net.isIP(ip);
  if (family === 0) return true;
  return blockedRanges.check(ip, family === 4 ? 'ipv4' : 'ipv6');
}

// Runs inside the socket's own DNS resolution, so the address that passes the
// check is the address that gets connected to - a separate pre-check followed
// by fetch() resolved twice and was open to DNS rebinding.
const publicOnlyLookup: LookupFunction = (hostname, options, callback) => {
  dns.lookup(hostname, { ...options, all: true }, (error, addresses) => {
    if (error) return callback(error, '', 0);
    if (
      addresses.length === 0 ||
      addresses.some((entry) => isPrivateOrReservedIp(entry.address))
    ) {
      return callback(new OfferFetchError(), '', 0);
    }
    if (options.all) {
      (callback as unknown as (e: null, a: dns.LookupAddress[]) => void)(
        null,
        addresses,
      );
      return;
    }
    callback(null, addresses[0].address, addresses[0].family);
  });
};

function get(url: URL, signal: AbortSignal): Promise<IncomingMessage> {
  // Node skips the lookup function for IP-literal hosts, so check those here.
  const host = url.hostname.replace(/^\[|\]$/g, '');
  if (net.isIP(host) && isPrivateOrReservedIp(host)) {
    return Promise.reject(new OfferFetchError());
  }

  const client = url.protocol === 'https:' ? https : http;
  return new Promise((resolve, reject) => {
    client
      .get(url, { lookup: publicOnlyLookup, signal }, resolve)
      .on('error', reject);
  });
}

async function readWithSizeLimit(response: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  let total = 0;

  for await (const chunk of response as AsyncIterable<Buffer>) {
    total += chunk.byteLength;
    if (total > MAX_RESPONSE_BYTES) {
      response.destroy();
      throw new OfferFetchError();
    }
    chunks.push(chunk);
  }

  return Buffer.concat(chunks).toString('utf-8');
}

async function fetchHtml(url: string): Promise<string> {
  const signal = AbortSignal.timeout(FETCH_TIMEOUT_MS);
  let currentUrl = new URL(url);

  for (let redirectCount = 0; ; redirectCount++) {
    if (redirectCount > MAX_REDIRECTS) throw new OfferFetchError();
    if (currentUrl.protocol !== 'http:' && currentUrl.protocol !== 'https:') {
      throw new OfferFetchError();
    }

    const response = await get(currentUrl, signal);
    const status = response.statusCode ?? 0;

    if (status >= 300 && status < 400) {
      response.resume();
      const location = response.headers.location;
      if (!location) throw new OfferFetchError();
      currentUrl = new URL(location, currentUrl);
      continue;
    }

    if (status < 200 || status >= 300) {
      response.resume();
      throw new OfferFetchError();
    }

    return readWithSizeLimit(response);
  }
}

export async function fetchAndStripUrl(url: string): Promise<string> {
  try {
    const html = await fetchHtml(url);
    return convert(html, { wordwrap: false }).trim().slice(0, MAX_TEXT_CHARS);
  } catch {
    throw new OfferFetchError();
  }
}
