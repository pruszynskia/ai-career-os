import { describe, expect, it } from 'vitest';

import type { OfferWithApplication } from '@/features/job-offer/types';

import { buildOfferPreviewHref, groupOffersByTier } from './unified-offer-list';

function offer(
  id: string,
  overrides: Partial<OfferWithApplication> = {},
): OfferWithApplication {
  return {
    id,
    ownerId: 'owner-1',
    url: null,
    source: 'RAW_TEXT',
    rawContent: '',
    company: 'Acme',
    title: 'Engineer',
    description: '',
    matchScore: 80,
    fit: null,
    expiresAt: null,
    isExpired: false,
    isFavorite: false,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    application: null,
    ...overrides,
  };
}

describe('groupOffersByTier', () => {
  it('buckets by RecommendedAction tier in tier order, dropping empty tiers', () => {
    const groups = groupOffersByTier([
      offer('a', {
        fit: {
          recommendedAction: 'CONSIDER',
        } as OfferWithApplication['fit'],
      }),
      offer('b'), // no fit -> "not scored" tier (null)
      offer('c', {
        fit: {
          recommendedAction: 'APPLY_IMMEDIATELY',
        } as OfferWithApplication['fit'],
      }),
    ]);

    expect(groups.map((g) => g.tier)).toEqual([1, 3, null]);
    expect(groups[0].offers.map((o) => o.id)).toEqual(['c']);
    expect(groups[1].offers.map((o) => o.id)).toEqual(['a']);
    expect(groups[2].offers.map((o) => o.id)).toEqual(['b']);
  });

  it('returns no groups for an empty offer list', () => {
    expect(groupOffersByTier([])).toEqual([]);
  });
});

describe('buildOfferPreviewHref', () => {
  it('links to the offer preview page with no query when none is set', () => {
    expect(buildOfferPreviewHref('offer-1', new URLSearchParams())).toBe(
      '/offers/offer-1/preview',
    );
  });

  it('forwards q/sort/favorite so the preview "back" link keeps the filtered view', () => {
    const searchParams = new URLSearchParams(
      'q=engineer&sort=matchScore&favorite=1&view=board',
    );
    expect(buildOfferPreviewHref('offer-1', searchParams)).toBe(
      '/offers/offer-1/preview?q=engineer&sort=matchScore&favorite=1',
    );
  });
});
