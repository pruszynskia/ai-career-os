import { describe, expect, it } from 'vitest';

import type { JobPreferences, WorkMode } from '@/entities/profile/types';
import type { FitAssessment } from '@/entities/job-offer/types';
import {
  computeHrCallbackProbability,
  computeMatchScore,
  computeMechanicalSubscores,
  detectWorkMode,
  extractSalaryTop,
  recommendedActionForScore,
} from './mechanical-subscores';

const BASE_PREFERENCES: JobPreferences = {
  workMode: null,
  salaryMin: null,
  salaryMax: null,
  salaryCurrency: null,
  specialization: null,
  employmentType: null,
  seniority: null,
  preferredTechnologies: [],
  companySize: null,
  industries: [],
  locationPreferences: [],
};

describe('computeMechanicalSubscores', () => {
  it('scores salary against the top of the disclosed range, not the floor', () => {
    const preferences = { ...BASE_PREFERENCES, salaryMin: 140_000 };
    const offerText = 'Salary: 120,000 - 150,000 PLN gross.';

    const { salary } = computeMechanicalSubscores(preferences, offerText);

    // The floor (120k) is below the 140k minimum; the top (150k) clears it.
    expect(salary.score).toBe(100);
  });

  it('scores a shortfall proportionally against the top of the range', () => {
    const preferences = { ...BASE_PREFERENCES, salaryMin: 200_000 };
    const offerText = 'Salary: 120,000 - 150,000 PLN gross.';

    const { salary } = computeMechanicalSubscores(preferences, offerText);

    expect(salary.score).toBe(75); // round(150000 / 200000 * 100)
  });

  it('records a missing preference as unknown rather than a silent zero', () => {
    const offerText = 'We use React, TypeScript and Postgres.';

    const { coreStack, industry, workMode, salary } = computeMechanicalSubscores(
      BASE_PREFERENCES,
      offerText,
    );

    expect(coreStack).toEqual({
      score: null,
      reasoning: 'No preferred technologies set on the profile.',
    });
    expect(industry.score).toBeNull();
    expect(workMode.score).toBeNull();
    expect(salary.score).toBeNull();
  });

  it('scores a real core-stack overlap from preferred technologies', () => {
    const preferences = {
      ...BASE_PREFERENCES,
      preferredTechnologies: ['React', 'TypeScript', 'Rust'],
    };
    const offerText = 'We use React, TypeScript and Postgres.';

    const { coreStack } = computeMechanicalSubscores(preferences, offerText);

    expect(coreStack.score).toBe(67); // 2/3 rounded
  });

  const WORK_MODE_TEXT: Record<WorkMode, string> = {
    REMOTE: 'This is a fully remote position.',
    HYBRID: 'This is a hybrid role, 2 days in office.',
    ONSITE: 'This is an onsite role, on-site every day.',
  };

  const WORK_MODE_CASES: Array<[WorkMode, WorkMode, number]> = [
    ['REMOTE', 'REMOTE', 100],
    ['REMOTE', 'HYBRID', 50],
    ['REMOTE', 'ONSITE', 0],
    ['HYBRID', 'REMOTE', 60],
    ['HYBRID', 'HYBRID', 100],
    ['HYBRID', 'ONSITE', 60],
    ['ONSITE', 'REMOTE', 0],
    ['ONSITE', 'HYBRID', 50],
    ['ONSITE', 'ONSITE', 100],
  ];

  it.each(WORK_MODE_CASES)(
    'scores preference %s against posted mode %s as %i',
    (preferred, posted, expected) => {
      const preferences = { ...BASE_PREFERENCES, workMode: preferred };
      const { workMode } = computeMechanicalSubscores(
        preferences,
        WORK_MODE_TEXT[posted],
      );
      expect(workMode.score).toBe(expected);
    },
  );
});

describe('detectWorkMode', () => {
  it('prefers hybrid when both hybrid and remote are mentioned', () => {
    expect(detectWorkMode('Hybrid role, some remote flexibility.')).toBe(
      'HYBRID',
    );
  });

  it('returns null when no mode is stated', () => {
    expect(detectWorkMode('Great team, great product.')).toBeNull();
  });
});

describe('extractSalaryTop', () => {
  it('ignores small ranges like a years-of-experience requirement', () => {
    expect(extractSalaryTop('Requires 5-10 years of experience.')).toBeNull();
  });

  it('reads a k-suffixed range', () => {
    expect(extractSalaryTop('Salary: 120k-150k USD.')).toBe(150_000);
  });

  it('reads a space-grouped PLN range', () => {
    expect(extractSalaryTop('Salary: 18 000 - 22 000 PLN gross.')).toBe(22_000);
  });

  it('reads a single currency-tagged figure with no range', () => {
    expect(extractSalaryTop('Salary: 20000 PLN.')).toBe(20_000);
    expect(extractSalaryTop('Salary: $20k.')).toBe(20_000);
  });

  it('returns null when no currency or range context is present', () => {
    expect(extractSalaryTop('We are a team of 20000 engineers.')).toBeNull();
  });
});

function criterion(score: number | null) {
  return { score, reasoning: 'test' };
}

describe('computeMatchScore', () => {
  it('renormalizes over the known criteria when some are unknown', () => {
    const criteria: FitAssessment['criteria'] = {
      technicalMatch: criterion(100), // weight 20
      seniorityMatch: criterion(100), // weight 15
      coreStack: criterion(null), // weight 15, unknown
      industry: criterion(null), // weight 10, unknown
      workMode: criterion(null), // weight 10, unknown
      salary: criterion(null), // weight 10, unknown
      architectureExperience: criterion(100), // weight 10
      companyAttractiveness: criterion(100), // weight 5
      experienceSimilarity: criterion(100), // weight 5
    };

    expect(computeMatchScore(criteria)).toBe(100);
  });

  it('never rounds an individual criterion, only the final average', () => {
    const criteria: FitAssessment['criteria'] = {
      technicalMatch: criterion(50),
      seniorityMatch: criterion(50),
      coreStack: criterion(50),
      industry: criterion(50),
      workMode: criterion(50),
      salary: criterion(50),
      architectureExperience: criterion(50),
      companyAttractiveness: criterion(50),
      experienceSimilarity: criterion(50),
    };

    expect(computeMatchScore(criteria)).toBe(50);
  });
});

describe('recommendedActionForScore', () => {
  it.each([
    [95, 'APPLY_IMMEDIATELY'],
    [90, 'APPLY_IMMEDIATELY'],
    [85, 'STRONG_OPPORTUNITY'],
    [80, 'STRONG_OPPORTUNITY'],
    [75, 'CONSIDER'],
    [70, 'CONSIDER'],
    [69, 'IGNORE'],
    [0, 'IGNORE'],
  ] as const)('bands a match score of %i as %s', (score, expected) => {
    expect(recommendedActionForScore(score)).toBe(expected);
  });
});

describe('computeHrCallbackProbability', () => {
  it('applies the full 25-point penalty when a hard years gate stacks with a domain gap', () => {
    const { hrCallbackProbability, callbackModifiers } =
      computeHrCallbackProbability({
        matchScore: 80,
        offerText: 'A normal posting.',
        seniorityScore: 20,
        industryScore: 0,
      });

    // 80 - 25 (hard gate + domain gap) - 10 (no salary disclosed in the text) = 45
    expect(hrCallbackProbability).toBe(45);
    expect(callbackModifiers).toEqual([
      { name: 'Hard years gate stacked with domain gap', delta: -25 },
      { name: 'Undisclosed salary', delta: -10 },
    ]);
  });

  it('records every modifier that fires and clamps the result to 0-100', () => {
    const { hrCallbackProbability, callbackModifiers } =
      computeHrCallbackProbability({
        matchScore: 5,
        offerText: 'Urgent hire, hundreds of applicants for this role.',
        seniorityScore: 10,
        industryScore: null,
      });

    expect(hrCallbackProbability).toBe(0);
    expect(callbackModifiers).toEqual(
      expect.arrayContaining([
        { name: 'Hard years gate', delta: -15 },
        { name: 'High applicant volume with no differentiator', delta: -10 },
        { name: 'Stated urgency', delta: 5 },
        { name: 'Undisclosed salary', delta: -10 },
      ]),
    );
  });

  it('can diverge from match_score in either direction', () => {
    const { hrCallbackProbability } = computeHrCallbackProbability({
      matchScore: 60,
      offerText: 'We build with LLMs and GPT-based agents. Flexible team.',
      seniorityScore: 95,
      industryScore: 100,
    });

    // 60 + 10 (AI culture) + 8 (flexible band) - 10 (no salary disclosed) = 68
    expect(hrCallbackProbability).toBe(68);
    expect(hrCallbackProbability).not.toBe(60);
  });
});
