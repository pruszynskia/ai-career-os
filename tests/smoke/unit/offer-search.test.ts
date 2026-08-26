import { describe, expect, it } from 'vitest';

import { buildSearchOrFilter } from '../../../src/shared/utils/offer-search';

describe('buildSearchOrFilter', () => {
  it('quotes the value so a comma cannot be read as the condition separator', () => {
    const filter = buildSearchOrFilter('a,b');
    expect(filter).toBe('title.ilike."%a,b%",company.ilike."%a,b%"');
  });

  it('escapes embedded quotes and backslashes', () => {
    const filter = buildSearchOrFilter('a"b\\c');
    expect(filter).toBe(
      'title.ilike."%a\\"b\\\\c%",company.ilike."%a\\"b\\\\c%"',
    );
  });
});
