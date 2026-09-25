import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import type { FitAssessment } from '@/entities/job-offer/types';

import { FitReport } from './fit-report';

function criterion(score: number | null, reasoning = 'reasoning') {
  return { score, reasoning };
}

function fit(overrides: Partial<FitAssessment> = {}): FitAssessment {
  return {
    criteria: {
      technicalMatch: criterion(92),
      seniorityMatch: criterion(85),
      coreStack: criterion(100),
      industry: criterion(70),
      workMode: criterion(100),
      salary: criterion(null),
      architectureExperience: criterion(80),
      companyAttractiveness: criterion(75),
      experienceSimilarity: criterion(78),
    },
    missingSkills: ['Storybook'],
    absentButTrue: ['Core Web Vitals'],
    hrCallbackProbability: 70,
    callbackModifiers: [{ name: 'posting older than 2 weeks', delta: -8 }],
    recommendedAction: 'APPLY_IMMEDIATELY',
    ...overrides,
  };
}

describe('FitReport', () => {
  it('groups the nine criteria under the two section headers', () => {
    const html = renderToStaticMarkup(
      <FitReport
        matchScore={88}
        fit={fit()}
        alwaysIncludeWhenRelevant={[]}
        onAddSkill={() => {}}
        addingSkill={null}
      />,
    );

    expect(html).toContain('Assessed from the offer');
    expect(html).toContain('Computed from your preferences');
  });

  it('renders a divergence Banner only when match and callback scores diverge', () => {
    const diverging = renderToStaticMarkup(
      <FitReport
        matchScore={88}
        fit={fit({ hrCallbackProbability: 70 })}
        alwaysIncludeWhenRelevant={[]}
        onAddSkill={() => {}}
        addingSkill={null}
      />,
    );
    expect(diverging).toContain('posting older than 2 weeks');

    const aligned = renderToStaticMarkup(
      <FitReport
        matchScore={88}
        fit={fit({ hrCallbackProbability: 85 })}
        alwaysIncludeWhenRelevant={[]}
        onAddSkill={() => {}}
        addingSkill={null}
      />,
    );
    expect(aligned).not.toContain('posting older than 2 weeks');
  });

  it('renders missing skills and pending skills as sibling columns', () => {
    const html = renderToStaticMarkup(
      <FitReport
        matchScore={88}
        fit={fit()}
        alwaysIncludeWhenRelevant={[]}
        onAddSkill={() => {}}
        addingSkill={null}
      />,
    );

    expect(html).toContain('Missing skills');
    expect(html).toContain('Skills you have but haven&#x27;t listed');
  });
});
