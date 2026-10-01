import { describe, expect, it } from 'vitest';

import { canonicalizeUrl } from './offer-fingerprint';

describe('canonicalizeUrl', () => {
  it('strips tracking params, www, trailing slash, and lowercases the host', () => {
    expect(
      canonicalizeUrl(
        'https://www.Example.com/jobs/123/?utm_source=x&utm_campaign=y',
      ),
    ).toBe('example.com/jobs/123');
  });

  it('keeps a non-tracking param like jk (job id)', () => {
    expect(
      canonicalizeUrl('https://indeed.com/viewjob?jk=abc123&utm_source=x'),
    ).toBe('indeed.com/viewjob?jk=abc123');
  });

  it('sorts kept params for stable comparison', () => {
    expect(canonicalizeUrl('https://example.com/jobs?b=2&a=1')).toBe(
      'example.com/jobs?a=1&b=2',
    );
  });

  it('returns null for a null/empty url', () => {
    expect(canonicalizeUrl(null)).toBeNull();
    expect(canonicalizeUrl(undefined)).toBeNull();
    expect(canonicalizeUrl('')).toBeNull();
  });

  it('returns null for an unparseable url', () => {
    expect(canonicalizeUrl('not a url')).toBeNull();
  });
});
