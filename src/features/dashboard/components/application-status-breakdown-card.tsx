import type { ApplicationBundle } from '@/entities/application/types';
import { APPLICATION_STATUS_LABELS } from '@/entities/application/types';
import { Grid, Heading, VStack } from '@/shared/ui/primitives';
import { StatCard } from '@/shared/ui/stat-card';

export function ApplicationStatusBreakdownCard({
  applications,
}: {
  applications: ApplicationBundle[];
}) {
  return (
    <VStack gap={2}>
      <Heading level={4} as="h2">
        Applications by status
      </Heading>
      <Grid cols={3} colsMd={6} gap={3}>
        {Object.entries(APPLICATION_STATUS_LABELS).map(([status, label]) => (
          <StatCard
            key={status}
            label={label}
            value={applications.filter((a) => a.status === status).length}
          />
        ))}
      </Grid>
    </VStack>
  );
}
