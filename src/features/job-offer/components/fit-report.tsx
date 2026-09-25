import type {
  FitAssessment,
  FitCriterionKey,
} from '@/entities/job-offer/types';

import {
  FIT_CRITERION_WEIGHTS,
  MECHANICAL_CRITERION_KEYS,
  fitCriterionKeys,
} from '@/entities/job-offer/types';
import { RecommendedActionBadge } from '@/features/job-offer/components/recommended-action-badge';
import { AsyncButton } from '@/shared/ui/async-button';
import { Banner } from '@/shared/ui/banner';
import { Card } from '@/shared/ui/card';
import {
  GridTable,
  GridTableHead,
  GridTableRow,
  gridTableNumericCellClassName,
} from '@/shared/ui/grid-table';
import { StatCard } from '@/shared/ui/stat-card';
import { Grid, Heading, Meter, Text, VStack } from '@/shared/ui/primitives';

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

// X-offer-fit.dc.html groups the nine criteria under two headers - "Assessed
// from the offer" (AI judgment) and "Computed from your preferences" - not
// by any mechanical/AI naming of our own. That grouping happens to be the
// same split as MECHANICAL_CRITERION_KEYS (coreStack/industry/workMode/
// salary are the "preferences" group; the rest are "assessed"), so it's
// derived from that constant rather than duplicated here.
const CRITERION_GROUPS: {
  label: string;
  meta: string;
  keys: readonly FitCriterionKey[];
}[] = [
  {
    label: 'Assessed from the offer',
    meta: 'AI judgment',
    keys: fitCriterionKeys.filter(
      (key) => !(MECHANICAL_CRITERION_KEYS as readonly string[]).includes(key),
    ),
  },
  {
    label: 'Computed from your preferences',
    meta: 'edit in Settings',
    keys: MECHANICAL_CRITERION_KEYS,
  },
];

const CRITERIA_COLUMNS = '1fr 56px 140px minmax(0,1.4fr)';

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

  const knownCount = fitCriterionKeys.filter(
    (key) => fit.criteria[key].score !== null,
  ).length;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Heading level={4} as="h2">
          Fit report
        </Heading>
        <Text size="xs" color="muted">
          {fitCriterionKeys.length} weighted criteria · {knownCount} known
        </Text>
      </div>

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
        <Banner tone="neutral">
          Match and callback probability differ by more than{' '}
          {DIVERGENCE_THRESHOLD} points:{' '}
          <Text as="span" size="sm" weight="medium">
            {fit.callbackModifiers
              .map(
                (modifier) =>
                  `${modifier.name} (${modifier.delta > 0 ? '+' : ''}${modifier.delta})`,
              )
              .join(', ')}
          </Text>
          .
        </Banner>
      )}

      <Card className="overflow-hidden">
        <GridTable columns={CRITERIA_COLUMNS}>
          <GridTableHead>
            <span>Criterion</span>
            <span className={gridTableNumericCellClassName}>Weight</span>
            <span>Score</span>
            <span>Reasoning</span>
          </GridTableHead>
          {CRITERION_GROUPS.map((group) => (
            <div key={group.label}>
              <div className="flex h-9 items-center gap-2 bg-[var(--surface-sunken)] px-4">
                <Text weight="semibold" size="sm">
                  {group.label}
                </Text>
                <Text size="xs" color="muted">
                  {group.meta}
                </Text>
              </div>
              {group.keys.map((key) => {
                const criterion = fit.criteria[key];
                return (
                  <GridTableRow
                    key={key}
                    className="h-auto min-h-10 items-start gap-x-5 py-2"
                  >
                    <Text weight="medium" size="sm" className="pt-0.5">
                      {FIT_CRITERION_LABEL[key]}
                    </Text>
                    <span className={`${gridTableNumericCellClassName} pt-0.5`}>
                      {FIT_CRITERION_WEIGHTS[key]}
                    </span>
                    {criterion.score !== null ? (
                      <div className="flex items-center gap-2 pt-1">
                        <Meter
                          variant="inline"
                          value={criterion.score}
                          className="w-14"
                        />
                        <span className={gridTableNumericCellClassName}>
                          {criterion.score}
                        </span>
                      </div>
                    ) : (
                      <Text size="sm" color="muted" className="pt-0.5">
                        Unknown
                      </Text>
                    )}
                    <Text size="sm" color="muted">
                      {criterion.reasoning}
                    </Text>
                  </GridTableRow>
                );
              })}
            </div>
          ))}
        </GridTable>
      </Card>

      <Grid cols={2} gap={4}>
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
                  variant="secondary"
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
      </Grid>
    </section>
  );
}
