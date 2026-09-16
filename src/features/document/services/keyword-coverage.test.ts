import { describe, expect, it } from 'vitest';

import type { FitAssessment } from '@/entities/job-offer/types';
import type { EvidenceBase } from '@/entities/profile/types';
import {
  buildTailoringReport,
  checkKeywordCoverage,
  derivePostingKeywords,
} from './keyword-coverage';

// Every check below runs synchronously on plain strings - no AI service is
// imported by keyword-coverage.ts, let alone awaited here.

describe('checkKeywordCoverage', () => {
  it('marks an exact literal match as covered', () => {
    const [verdict] = checkKeywordCoverage(
      ['Kubernetes'],
      'Deployed services on Kubernetes across three regions.',
    );
    expect(verdict).toEqual({
      keyword: 'Kubernetes',
      covered: true,
      matchedSpan: 'Kubernetes',
    });
  });

  it('marks a plural variant as covered', () => {
    const [verdict] = checkKeywordCoverage(
      ['framework'],
      'Built internal frameworks used by five teams.',
    );
    expect(verdict.covered).toBe(true);
    expect(verdict.matchedSpan).toBe('frameworks');
  });

  it('marks a true-but-differently-phrased skill as missed', () => {
    // The skill is real (per the evidence base) but the CV text never uses
    // the literal posting term - an ATS scan, and this check, still call it
    // a miss.
    const [verdict] = checkKeywordCoverage(
      ['Kubernetes'],
      'Ran container workloads on a managed orchestration platform.',
    );
    expect(verdict.covered).toBe(false);
    expect(verdict.matchedSpan).toBeNull();
  });

  it('returns an empty list for an empty keyword list', () => {
    expect(checkKeywordCoverage([], 'Some CV text.')).toEqual([]);
  });

  it('matches a keyword that starts/ends on a non-word character', () => {
    const [dotNet, cSharp, cPlusPlus] = checkKeywordCoverage(
      ['.NET', 'C#', 'C++'],
      'Built services in .NET, then moved to C# and C++.',
    );
    expect(dotNet.covered).toBe(true);
    expect(cSharp.covered).toBe(true);
    expect(cPlusPlus.covered).toBe(true);
  });

  it('matches regardless of hyphenation, including none at all', () => {
    const [verdict] = checkKeywordCoverage(
      ['micro-services'],
      'Designed and shipped microservices for the platform team.',
    );
    expect(verdict.covered).toBe(true);
  });
});

const FIT: FitAssessment = {
  criteria: {
    technicalMatch: { score: 80, reasoning: '' },
    seniorityMatch: { score: 80, reasoning: '' },
    coreStack: { score: 80, reasoning: '' },
    industry: { score: 80, reasoning: '' },
    workMode: { score: 80, reasoning: '' },
    salary: { score: 80, reasoning: '' },
    architectureExperience: { score: 80, reasoning: '' },
    companyAttractiveness: { score: 80, reasoning: '' },
    experienceSimilarity: { score: 80, reasoning: '' },
  },
  missingSkills: ['Terraform'],
  absentButTrue: ['Kubernetes'],
  hrCallbackProbability: 70,
  callbackModifiers: [],
  recommendedAction: 'CONSIDER',
};

describe('derivePostingKeywords', () => {
  it('dedupes missingSkills and absentButTrue', () => {
    const fit: FitAssessment = {
      ...FIT,
      missingSkills: ['Terraform', 'Kubernetes'],
      absentButTrue: ['Kubernetes'],
    };
    expect(derivePostingKeywords(fit)).toEqual(['Terraform', 'Kubernetes']);
  });
});

describe('buildTailoringReport', () => {
  const evidence: EvidenceBase = {
    claims: [
      {
        id: 'claim-1',
        kind: 'skill',
        text: 'Ran production workloads on Kubernetes for two years',
        sourceRef: 'exp-1',
        riskLevel: 'low',
        metric: null,
        state: 'TRUSTED',
        note: null,
      },
    ],
    neverInclude: [],
    alwaysIncludeWhenRelevant: [],
  };

  it('covers absentButTrue when the tailored CV names it, and links the evidence claim', () => {
    const report = buildTailoringReport({
      fit: FIT,
      cvText: 'Ran production workloads on Kubernetes for two years.',
      evidence,
      claimsUsed: ['claim-1'],
    });

    expect(report.totalCount).toBe(2);
    expect(report.coveredCount).toBe(1);
    const covered = report.keywords.find((k) => k.keyword === 'Kubernetes');
    expect(covered?.covered).toBe(true);
    expect(covered?.evidenceClaimId).toBe('claim-1');
  });

  it('lists missingSkills as the gap list regardless of coverage', () => {
    const report = buildTailoringReport({
      fit: FIT,
      cvText: 'Ran production workloads on Kubernetes for two years.',
      evidence,
      claimsUsed: ['claim-1'],
    });

    expect(report.gaps).toEqual(['Terraform']);
  });
});
