import Link from 'next/link';

import type { ResponseRateReadout } from '@/features/dashboard/services/response-rate-readout';

import { MIN_SAMPLE_SIZE } from '@/features/dashboard/services/response-rate-readout';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { Text, VStack } from '@/shared/ui/primitives';
import { StatCard } from '@/shared/ui/stat-card';

// Below MIN_SAMPLE_SIZE a percentage is noise dressed up as insight
// (TASK-085), so every group renders "Not enough data" instead of a rate -
// see computeResponseRateReadout for why.
function groupValue(group: { total: number; responseRate: number | null }) {
  return group.responseRate === null
    ? 'Not enough data'
    : `${Math.round(group.responseRate * 100)}%`;
}

function GroupSection({
  title,
  groups,
}: {
  title: string;
  groups: ResponseRateReadout['byFitBand'];
}) {
  if (groups.length === 0) return null;

  return (
    <VStack gap={2}>
      <Text size="sm" weight="medium" color="muted">
        {title}
      </Text>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {groups.map((group) => (
          <StatCard
            key={group.key}
            label={`${group.label} (${group.total})`}
            value={groupValue(group)}
          />
        ))}
      </div>
    </VStack>
  );
}

// readout is null on the Free plan (TASK-088 gates the outcome readout
// behind Pro) - shown as an inline upgrade prompt rather than hiding the
// card entirely.
export function ResponseRateCard({
  readout,
}: {
  readout: ResponseRateReadout | null;
}) {
  const hasEnoughData =
    readout !== null && readout.totalConsidered >= MIN_SAMPLE_SIZE;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Response rate</CardTitle>
      </CardHeader>
      <CardContent>
        {readout === null ? (
          <EmptyState
            message="See response rates by fit band, callback band and outreach channel on Pro."
            action={
              <Button asChild size="sm">
                <Link href="/pricing">Upgrade to Pro</Link>
              </Button>
            }
          />
        ) : !hasEnoughData ? (
          <EmptyState
            message={`Not enough applications yet to report a response rate — track at least ${MIN_SAMPLE_SIZE} to see this readout.`}
          />
        ) : (
          <VStack gap={4}>
            <GroupSection title="By fit band" groups={readout.byFitBand} />
            <GroupSection
              title="By callback band"
              groups={readout.byCallbackBand}
            />
            <GroupSection
              title="By outreach channel"
              groups={readout.byChannel}
            />
            <Text size="sm" color="muted">
              Median days to first reply:{' '}
              {readout.medianDaysToFirstReply !== null
                ? Math.round(readout.medianDaysToFirstReply)
                : 'Not enough data'}
            </Text>
          </VStack>
        )}
      </CardContent>
    </Card>
  );
}
