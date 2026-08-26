import type { ApplicationBundle } from '@/entities/application/types';
import { APPLICATION_STATUS_LABELS } from '@/entities/application/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Grid } from '@/shared/ui/primitives';
import { StatCard } from '@/shared/ui/stat-card';

export function ApplicationStatusBreakdownCard({
  applications,
}: {
  applications: ApplicationBundle[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Applications by status</CardTitle>
      </CardHeader>
      <CardContent>
        <Grid cols={2} colsMd={3} gap={3}>
          {Object.entries(APPLICATION_STATUS_LABELS).map(([status, label]) => (
            <StatCard
              key={status}
              label={label}
              value={applications.filter((a) => a.status === status).length}
            />
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}
