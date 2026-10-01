import { TierMarker } from '@/entities/job-offer/ui/tier-marker';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import {
  GridTable,
  GridTableHead,
  GridTableRow,
  gridTableNumericCellClassName,
} from '@/shared/ui/grid-table';
import { StatCard } from '@/shared/ui/stat-card';
import { Tag } from '@/shared/ui/tag';
import { Grid, Meter, Text } from '@/shared/ui/primitives';

// Static stand-in for the real fit report (src/features/job-offer/components
// /fit-report.tsx), built from the same GridTable/StatCard/Meter/TierMarker
// primitives with literal sample data - the real component takes an
// onAddSkill handler that only makes sense wired to a signed-in owner's
// data, not something a marketing page can fake cleanly as a prop.
const SAMPLE_CRITERIA = [
  {
    label: 'Technical match',
    score: 92,
    reasoning: 'React, TypeScript and Next.js match the stack directly.',
  },
  {
    label: 'Seniority match',
    score: 85,
    reasoning: 'Scope and ownership line up with the posting.',
  },
  {
    label: 'Core stack',
    score: 100,
    reasoning: 'Every required technology is already on file.',
  },
];

const COLUMNS = 'minmax(0,1fr) 90px minmax(0,1.3fr)';

export function FitReportFrame() {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Fit report</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Grid cols={2} gap={3}>
          <StatCard label="Match score" value="88%" />
          <StatCard label="Callback probability" value="70%" />
        </Grid>

        <TierMarker tier={1}>Apply immediately</TierMarker>

        <GridTable columns={COLUMNS}>
          <GridTableHead>
            <span>Criterion</span>
            <span className={gridTableNumericCellClassName}>Score</span>
            <span>Reasoning</span>
          </GridTableHead>
          {SAMPLE_CRITERIA.map((criterion) => (
            <GridTableRow
              key={criterion.label}
              className="h-auto min-h-9 py-1.5"
            >
              <Text weight="medium" size="sm">
                {criterion.label}
              </Text>
              <div className="flex items-center gap-2">
                <Meter
                  variant="inline"
                  value={criterion.score}
                  className="w-10"
                />
                <span className={gridTableNumericCellClassName}>
                  {criterion.score}
                </span>
              </div>
              <Text size="sm" color="muted" className="truncate">
                {criterion.reasoning}
              </Text>
            </GridTableRow>
          ))}
        </GridTable>

        <div className="flex items-center gap-2">
          <Text size="sm" color="muted">
            Missing:
          </Text>
          <Tag size="sm">Storybook</Tag>
          <Tag size="sm">Vitest</Tag>
        </div>
      </CardContent>
    </Card>
  );
}
