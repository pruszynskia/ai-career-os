import type {
  FitAssessment,
  FitCriterionKey,
} from '@/entities/job-offer/types';

import {
  FIT_CRITERION_WEIGHTS,
  fitCriterionKeys,
} from '@/entities/job-offer/types';
import { RecommendedActionBadge } from '@/features/job-offer/components/recommended-action-badge';
import { AsyncButton } from '@/shared/ui/async-button';
import { ListRow } from '@/shared/ui/list-row';
import { StatCard } from '@/shared/ui/stat-card';
import { Divider, Grid, Heading, Text, VStack } from '@/shared/ui/primitives';

const FIT_CRITERION_LABEL: Record<FitCriterionKey, string> = {
  technicalMatch: 'Technical match',
  seniorityMatch: 'Seniority match',
  coreStack: 'Core stack',
  industry: 'Industry',
  workMode: 'Work mode',
  salary: 'Salary',
  architectureExperience: 'Architecture experience',
  companyAttractiveness: 'Company attractiveness',
  experienceSimilarity: 'Experience similarity',
};

// The two headline numbers are the whole point of the feature - a strong
// fit can still carry a low callback probability, and averaging them away
// would hide exactly the signal this report exists to surface.
const DIVERGENCE_THRESHOLD = 15;

export function FitReport({
  matchScore,
  fit,
  alwaysIncludeWhenRelevant,
  onAddSkill,
  addingSkill,
}: {
  matchScore: number | null;
  fit: FitAssessment;
  alwaysIncludeWhenRelevant: string[];
  onAddSkill: (skill: string) => void;
  addingSkill: string | null;
}) {
  const diverges =
    matchScore !== null &&
    Math.abs(matchScore - fit.hrCallbackProbability) > DIVERGENCE_THRESHOLD;

  const pendingSkills = fit.absentButTrue.filter(
    (skill) => !alwaysIncludeWhenRelevant.includes(skill),
  );

  return (
    <section className="flex flex-col gap-4">
      <Heading level={4} as="h2">
        Fit report
      </Heading>

      <Grid cols={2} gap={3}>
        <StatCard
          label="Match score"
          value={matchScore !== null ? `${matchScore}%` : 'Unknown'}
        />
        <StatCard
          label="Callback probability"
          value={`${fit.hrCallbackProbability}%`}
        />
      </Grid>

      <RecommendedActionBadge action={fit.recommendedAction} />

      {diverges && (
        <Text size="sm" color="muted">
          Match and callback probability differ by more than{' '}
          {DIVERGENCE_THRESHOLD} points —{' '}
          {fit.callbackModifiers
            .map(
              (modifier) =>
                `${modifier.name} (${modifier.delta > 0 ? '+' : ''}${modifier.delta})`,
            )
            .join(', ')}
          .
        </Text>
      )}

      <VStack gap={0}>
        {fitCriterionKeys.map((key) => {
          const criterion = fit.criteria[key];
          return (
            <ListRow
              key={key}
              title={FIT_CRITERION_LABEL[key]}
              supporting={criterion.reasoning}
              meta={`${criterion.score ?? 'unknown'}/100 · weight ${FIT_CRITERION_WEIGHTS[key]}`}
            />
          );
        })}
      </VStack>

      <Divider />

      <VStack gap={2}>
        <Heading level={5} as="h3">
          Missing skills
        </Heading>
        {fit.missingSkills.length > 0 ? (
          <ul className="list-disc pl-5 text-sm">
            {fit.missingSkills.map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>
        ) : (
          <Text size="sm" color="muted">
            None.
          </Text>
        )}
      </VStack>

      {pendingSkills.length > 0 && (
        <VStack gap={2}>
          <Heading level={5} as="h3">
            Skills you have but haven&apos;t listed
          </Heading>
          {pendingSkills.map((skill) => (
            <div
              key={skill}
              className="flex items-center justify-between gap-2"
            >
              <Text size="sm">{skill}</Text>
              <AsyncButton
                type="button"
                size="sm"
                variant="outline"
                pending={addingSkill === skill}
                disabled={addingSkill !== null && addingSkill !== skill}
                onClick={() => onAddSkill(skill)}
              >
                Add to profile
              </AsyncButton>
            </div>
          ))}
        </VStack>
      )}
    </section>
  );
}
