import { createHash } from 'crypto';

export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

export function canonicalizeUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
    const path = parsed.pathname.replace(/\/+$/, '');
    return `${host}${path}`;
  } catch {
    return null;
  }
}

export function hashContent(value: string): string {
  return createHash('sha256').update(normalizeText(value)).digest('hex');
}

export interface OfferFingerprint {
  companyTitleKey: string;
  canonicalUrl: string | null;
  contentHash: string;
}

export function computeOfferFingerprint(input: {
  company: string;
  title: string;
  url?: string | null;
  rawContent: string;
}): OfferFingerprint {
  return {
    companyTitleKey: `${normalizeText(input.company)}|${normalizeText(input.title)}`,
    canonicalUrl: canonicalizeUrl(input.url),
    contentHash: hashContent(input.rawContent),
  };
}

// ponytail: company+title matching alone can false-positive on a recurring
// generic title reposted by the same company (e.g. "Software Engineer" at
// Google, months apart). Catching that without false positives needs actual
// posting-date/req-id data or semantic similarity — out of scope per the
// task (no embeddings). Upgrade path: compare only against offers added
// within a recent window, or require user confirmation before flagging on
// company+title alone.
export function isDuplicateFingerprint(
  a: OfferFingerprint,
  b: OfferFingerprint,
): boolean {
  if (a.companyTitleKey === b.companyTitleKey) return true;
  if (a.canonicalUrl && b.canonicalUrl && a.canonicalUrl === b.canonicalUrl) {
    return true;
  }
  return a.contentHash === b.contentHash;
}
