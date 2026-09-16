import { describe, expect, it } from 'vitest';

import type { EvidenceBase } from '@/entities/profile/types';
import {
  ClaimValidationError,
  NoEvidenceBaseError,
  assertEvidenceBase,
  assertValidClaims,
  findClaimViolations,
} from './claim-validator';

const EVIDENCE: EvidenceBase = {
  claims: [
    {
      id: 'claim-1',
      kind: 'skill',
      text: 'Built a React component library',
      sourceRef: 'exp-1',
      riskLevel: 'low',
      metric: null,
      state: 'TRUSTED',
      note: null,
    },
    {
      id: 'claim-2',
      kind: 'experience',
      text: 'Managed a team of contractors',
      sourceRef: 'exp-2',
      riskLevel: 'high',
      metric: null,
      state: 'EXCLUDED',
      note: 'Owner asked this never be mentioned.',
    },
  ],
  neverInclude: ['salary expectations'],
  alwaysIncludeWhenRelevant: [],
};

describe('findClaimViolations', () => {
  it('flags a claim id absent from the evidence base', () => {
    const violations = findClaimViolations(EVIDENCE, {
      claimsUsed: ['claim-unknown'],
      text: 'Some tailored content.',
    });

    expect(violations).toEqual(['Unknown claim id cited: claim-unknown']);
  });

  it('flags an EXCLUDED claim cited by id', () => {
    const violations = findClaimViolations(EVIDENCE, {
      claimsUsed: ['claim-2'],
      text: 'Some tailored content.',
    });

    expect(violations).toEqual(['Excluded claim cited: claim-2']);
  });

  it('flags output text containing a neverInclude phrase', () => {
    const violations = findClaimViolations(EVIDENCE, {
      claimsUsed: ['claim-1'],
      text: 'Happy to discuss salary expectations in the interview.',
    });

    expect(violations).toEqual([
      'neverInclude phrase present: salary expectations',
    ]);
  });

  it('returns no violations for a clean generation', () => {
    const violations = findClaimViolations(EVIDENCE, {
      claimsUsed: ['claim-1'],
      text: 'Built a React component library used across the product.',
    });

    expect(violations).toEqual([]);
  });

  it('flags non-empty output that cites no claims despite usable claims existing', () => {
    const violations = findClaimViolations(EVIDENCE, {
      claimsUsed: [],
      text: 'Some generated content with no citations.',
    });

    expect(violations).toEqual([
      'No claims cited despite a non-empty evidence base and generated text',
    ]);
  });

  it('does not flag empty claimsUsed when the output is also empty', () => {
    const violations = findClaimViolations(EVIDENCE, {
      claimsUsed: [],
      text: '   ',
    });

    expect(violations).toEqual([]);
  });
});

describe('assertEvidenceBase', () => {
  it('throws NoEvidenceBaseError when there are no usable claims', () => {
    expect(() =>
      assertEvidenceBase({
        claims: [],
        neverInclude: [],
        alwaysIncludeWhenRelevant: [],
      }),
    ).toThrow(NoEvidenceBaseError);
  });

  it('throws when every claim is EXCLUDED', () => {
    expect(() =>
      assertEvidenceBase({
        claims: [EVIDENCE.claims[1]],
        neverInclude: [],
        alwaysIncludeWhenRelevant: [],
      }),
    ).toThrow(NoEvidenceBaseError);
  });

  it('does not throw when a usable claim exists', () => {
    expect(() => assertEvidenceBase(EVIDENCE)).not.toThrow();
  });
});

describe('assertValidClaims', () => {
  it('throws ClaimValidationError when violations are present', () => {
    expect(() =>
      assertValidClaims(EVIDENCE, {
        claimsUsed: ['claim-unknown'],
        text: 'Some content.',
      }),
    ).toThrow(ClaimValidationError);
  });

  it('does not throw for a clean generation', () => {
    expect(() =>
      assertValidClaims(EVIDENCE, {
        claimsUsed: ['claim-1'],
        text: 'Clean content.',
      }),
    ).not.toThrow();
  });
});
