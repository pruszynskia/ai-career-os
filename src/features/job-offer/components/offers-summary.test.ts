import { describe, expect, it } from 'vitest';

import { aggregateResponseRate } from './offers-summary';

describe('aggregateResponseRate', () => {
  it('returns a rounded percentage at/above the minimum sample size', () => {
    expect(
      aggregateResponseRate({ total: 6, responded: 3, minSampleSize: 5 }),
    ).toBe(50); // 3/6 = 50%
  });

  it('returns null below the minimum sample size', () => {
    expect(
      aggregateResponseRate({ total: 3, responded: 1, minSampleSize: 5 }),
    ).toBeNull();
  });

  it('returns null for zero considered applications', () => {
    expect(
      aggregateResponseRate({ total: 0, responded: 0, minSampleSize: 5 }),
    ).toBeNull();
  });
});
