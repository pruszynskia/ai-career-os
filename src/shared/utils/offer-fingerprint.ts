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

export type FingerprintMatchSignal =
  | 'canonical-url'
  | 'content-hash'
  | 'company-title';

// Returns which signal matched, strongest first, or null. 'company-title'
// alone false-positives on a recurring generic title reposted by the same
// company months apart, so the caller gates it behind a recency window
// (add-offer.service.ts); 'canonical-url' and 'content-hash' are exact and
// stay unconditional.
export function isDuplicateFingerprint(
  a: OfferFingerprint,
  b: OfferFingerprint,
): FingerprintMatchSignal | null {
  if (a.canonicalUrl && b.canonicalUrl && a.canonicalUrl === b.canonicalUrl) {
    return 'canonical-url';
  }
  if (a.contentHash === b.contentHash) return 'content-hash';
  if (a.companyTitleKey === b.companyTitleKey) return 'company-title';
  return null;
}

// A bare company+title match false-positives on a generic role reposted
// months later, so it only counts as a duplicate when the existing offer is
// recent. Exact URL / content matches are unconditional.
export const COMPANY_TITLE_RECENCY_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

export function isDuplicateWithinWindow(
  signal: FingerprintMatchSignal,
  existingCreatedAt: Date,
  now: number = Date.now(),
): boolean {
  if (signal !== 'company-title') return true;
  return now - existingCreatedAt.getTime() <= COMPANY_TITLE_RECENCY_WINDOW_MS;
}
