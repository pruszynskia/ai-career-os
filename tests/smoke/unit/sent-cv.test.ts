import { describe, expect, it } from 'vitest';

import { canBeSentCv } from '../../../src/entities/cv-document/types';

describe('canBeSentCv', () => {
  it('accepts a CV tailored for the offer', () => {
    expect(
      canBeSentCv(
        { jobOfferId: 'offer-1', isMaster: false, kind: 'TAILORED' },
        'offer-1',
      ),
    ).toBe(true);
  });

  it('accepts the owner master CV as the fallback', () => {
    expect(
      canBeSentCv(
        { jobOfferId: null, isMaster: true, kind: 'MASTER' },
        'offer-1',
      ),
    ).toBe(true);
  });

  it('rejects the master cover letter', () => {
    expect(
      canBeSentCv(
        { jobOfferId: null, isMaster: true, kind: 'COVER_LETTER' },
        'offer-1',
      ),
    ).toBe(false);
  });

  it('rejects a CV tailored for another offer', () => {
    expect(
      canBeSentCv(
        { jobOfferId: 'offer-2', isMaster: false, kind: 'TAILORED' },
        'offer-1',
      ),
    ).toBe(false);
  });
});
