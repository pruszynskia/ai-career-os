import { describe, expect, it } from 'vitest';

import {
  COMPANY_TITLE_RECENCY_WINDOW_MS,
  canonicalizeUrl,
  computeOfferFingerprint,
  isDuplicateFingerprint,
  isDuplicateWithinWindow,
  normalizeText,
} from '../../../src/shared/utils/offer-fingerprint';

describe('normalizeText', () => {
  it('lowercases, strips punctuation, and collapses whitespace', () => {
    expect(normalizeText('  Senior  Engineer!  ')).toBe('senior engineer');
  });
});

describe('canonicalizeUrl', () => {
  it('strips tracking params but keeps others, sorted for stable comparison', () => {
    expect(
      canonicalizeUrl('https://www.acme.com/jobs/1?utm_source=linkedin'),
    ).toBe(canonicalizeUrl('https://acme.com/jobs/1'));
    // PIPE-2: a real identifying param (Indeed/Greenhouse-style ?jk=) must
    // NOT be dropped - two different jobs shouldn't canonicalize the same.
    expect(canonicalizeUrl('https://indeed.com/viewjob?jk=a')).not.toBe(
      canonicalizeUrl('https://indeed.com/viewjob?jk=b'),
    );
    expect(canonicalizeUrl('https://indeed.com/viewjob?b=2&a=1')).toBe(
      canonicalizeUrl('https://indeed.com/viewjob?a=1&b=2'),
    );
  });
});

describe('isDuplicateFingerprint', () => {
  it('reports canonical-url when the job link matches, ignoring tracking params', () => {
    const a = computeOfferFingerprint({
      company: 'Acme',
      title: 'Senior Engineer',
      url: 'https://acme.com/jobs/1',
      rawContent: 'We are hiring a senior engineer.',
    });
    const b = computeOfferFingerprint({
      company: 'Globex',
      title: 'Product Manager',
      url: 'https://www.acme.com/jobs/1?utm_source=linkedin',
      rawContent: 'Different posting text entirely.',
    });

    expect(isDuplicateFingerprint(a, b)).toBe('canonical-url');
  });

  it('reports content-hash when the offer text matches but url and title differ', () => {
    const a = computeOfferFingerprint({
      company: 'Acme',
      title: 'Senior Engineer',
      url: 'https://acme.com/jobs/1',
      rawContent: 'We are hiring a senior engineer!',
    });
    const b = computeOfferFingerprint({
      company: 'Acme Inc',
      title: 'Staff Engineer',
      url: 'https://boards.example.com/acme/42',
      rawContent: '  we are hiring a senior engineer  ',
    });

    expect(isDuplicateFingerprint(a, b)).toBe('content-hash');
  });

  it('reports company-title when only the company and title match', () => {
    const a = computeOfferFingerprint({
      company: 'Acme',
      title: 'Senior Engineer',
      url: 'https://acme.com/jobs/1',
      rawContent: 'We are hiring a senior engineer.',
    });
    const b = computeOfferFingerprint({
      company: 'ACME',
      title: 'senior engineer',
      url: 'https://acme.com/jobs/2',
      rawContent: 'A completely different description.',
    });

    expect(isDuplicateFingerprint(a, b)).toBe('company-title');
  });

  it('returns null for unrelated offers', () => {
    const a = computeOfferFingerprint({
      company: 'Acme',
      title: 'Senior Engineer',
      rawContent: 'We are hiring a senior engineer.',
    });
    const b = computeOfferFingerprint({
      company: 'Globex',
      title: 'Product Manager',
      rawContent: 'We are hiring a product manager.',
    });

    expect(isDuplicateFingerprint(a, b)).toBeNull();
  });
});

describe('isDuplicateWithinWindow', () => {
  const now = Date.UTC(2026, 0, 31);

  it('counts canonical-url and content-hash matches regardless of age', () => {
    const old = new Date(now - COMPANY_TITLE_RECENCY_WINDOW_MS * 10);
    expect(isDuplicateWithinWindow('canonical-url', old, now)).toBe(true);
    expect(isDuplicateWithinWindow('content-hash', old, now)).toBe(true);
  });

  it('counts a company-title match inside the recency window', () => {
    const recent = new Date(now - COMPANY_TITLE_RECENCY_WINDOW_MS + 1000);
    expect(isDuplicateWithinWindow('company-title', recent, now)).toBe(true);
  });

  it('ignores a company-title match outside the recency window', () => {
    const stale = new Date(now - COMPANY_TITLE_RECENCY_WINDOW_MS - 1000);
    expect(isDuplicateWithinWindow('company-title', stale, now)).toBe(false);
  });
});
