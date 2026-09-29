import { describe, expect, it } from 'vitest';

import type { CvDocument } from '@/entities/cv-document/types';

import { isPreviousVersion, matchesTypeFilter } from './document-list';

function document(overrides: Partial<CvDocument> = {}): CvDocument {
  return {
    id: 'doc-1',
    ownerId: 'owner-1',
    isMaster: true,
    content: 'content',
    jobOfferId: null,
    kind: 'MASTER',
    tailoringReport: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

describe('matchesTypeFilter', () => {
  it('matches every kind under "all"', () => {
    expect(matchesTypeFilter(document({ kind: 'TAILORED' }), 'all')).toBe(true);
  });

  it('groups OPTIMIZED/TAILORED/OPTIMIZED_COVER_LETTER under "GENERATED"', () => {
    for (const kind of [
      'OPTIMIZED',
      'TAILORED',
      'OPTIMIZED_COVER_LETTER',
    ] as const) {
      expect(matchesTypeFilter(document({ kind }), 'GENERATED')).toBe(true);
    }
    expect(matchesTypeFilter(document({ kind: 'MASTER' }), 'GENERATED')).toBe(
      false,
    );
  });

  it('matches MASTER/COVER_LETTER filters by exact kind', () => {
    expect(matchesTypeFilter(document({ kind: 'MASTER' }), 'MASTER')).toBe(
      true,
    );
    expect(
      matchesTypeFilter(document({ kind: 'COVER_LETTER' }), 'MASTER'),
    ).toBe(false);
  });
});

describe('isPreviousVersion', () => {
  it('flags a demoted master, but not the current one', () => {
    expect(
      isPreviousVersion(document({ kind: 'MASTER', isMaster: false })),
    ).toBe(true);
    expect(
      isPreviousVersion(document({ kind: 'MASTER', isMaster: true })),
    ).toBe(false);
  });

  it('flags a demoted owner-level cover letter, but not a per-offer one', () => {
    expect(
      isPreviousVersion(
        document({ kind: 'COVER_LETTER', isMaster: false, jobOfferId: null }),
      ),
    ).toBe(true);
    expect(
      isPreviousVersion(
        document({
          kind: 'COVER_LETTER',
          isMaster: false,
          jobOfferId: 'offer-1',
        }),
      ),
    ).toBe(false);
  });

  it('never flags generated documents (isMaster is always false for them)', () => {
    for (const kind of [
      'OPTIMIZED',
      'TAILORED',
      'OPTIMIZED_COVER_LETTER',
    ] as const) {
      expect(
        isPreviousVersion(document({ kind, isMaster: false })),
      ).toBe(false);
    }
  });
});
