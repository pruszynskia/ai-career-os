import { describe, expect, it } from 'vitest';

import {
  computeOfferFingerprint,
  isDuplicateFingerprint,
  normalizeText,
} from '../../../src/shared/utils/offer-fingerprint';

describe('normalizeText', () => {
  it('lowercases, strips punctuation, and collapses whitespace', () => {
    expect(normalizeText('  Senior  Engineer!  ')).toBe('senior engineer');
  });
});

describe('computeOfferFingerprint / isDuplicateFingerprint', () => {
  it('flags the same company and title as a duplicate', () => {
    const a = computeOfferFingerprint({
      company: 'Acme',
      title: 'Senior Engineer',
      url: 'https://acme.com/jobs/1',
      rawContent: 'We are hiring a senior engineer.',
    });
    const b = computeOfferFingerprint({
      company: 'Acme',
      title: 'Senior Engineer',
      url: 'https://acme.com/jobs/1?ref=linkedin',
      rawContent: 'Different posting text entirely.',
    });

    expect(isDuplicateFingerprint(a, b)).toBe(true);
  });

  it('does not flag unrelated offers as duplicates', () => {
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

    expect(isDuplicateFingerprint(a, b)).toBe(false);
  });
});
