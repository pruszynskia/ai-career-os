'use client';

import Link from 'next/link';
import { useState } from 'react';

import type { ResponseRateReadout } from '@/features/dashboard/services/response-rate-readout';

import { MIN_SAMPLE_SIZE } from '@/features/dashboard/services/response-rate-readout';
import { Button } from '@/shared/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import {
  Meter,
  SegmentedControl,
  SegmentedControlItem,
  Text,
  VStack,
} from '@/shared/ui/primitives';

// Below MIN_SAMPLE_SIZE a percentage is noise dressed up as insight
// (TASK-085), so every group renders "Not enough data" instead of a rate -
// see computeResponseRateReadout for why.
function groupValue(group: { total: number; responseRate: number | null }) {
  return group.responseRate === null
    ? 'Not enough data'
    : `${Math.round(group.responseRate * 100)}%`;
}

// Which of ResponseRateReadout's three groupings the SegmentedControl
// switches between - callback band leads, matching X-dashboard.dc.html's
// default tab.
const GROUPINGS = [
  { key: 'byCallbackBand', label: 'Callback band' },
  { key: 'byFitBand', label: 'Fit band' },
  { key: 'byChannel', label: 'Channel' },
] as const satisfies { key: keyof ResponseRateReadout; label: string }[];
type GroupingKey = (typeof GROUPINGS)[number]['key'];

// readout is null on the Free plan (TASK-088 gates the outcome readout
// behind Pro) - shown as an inline upgrade prompt rather than hiding the
// card entirely.
export function ResponseRateCard({
  readout,
}: {
  readout: ResponseRateReadout | null;
}) {
  const [grouping, setGrouping] = useState<GroupingKey>('byCallbackBand');
  const hasEnoughData =
    readout !== null && readout.totalConsidered >= MIN_SAMPLE_SIZE;
  const groups = readout ? readout[grouping] : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Response rate</CardTitle>
        <CardAction>
          <Text size="xs" color="muted">
            Pro
          </Text>
        </CardAction>
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
            <SegmentedControl
              value={grouping}
              onValueChange={(value) => setGrouping(value as GroupingKey)}
              aria-label="Group response rate by"
            >
              {GROUPINGS.map(({ key, label }) => (
                <SegmentedControlItem key={key} value={key}>
                  {label}
                </SegmentedControlItem>
              ))}
            </SegmentedControl>
            {groups.length === 0 ? (
              <EmptyState message="No data for this grouping yet." />
            ) : (
              <VStack gap={3}>
                {groups.map((group) => (
                  <VStack gap={1} key={group.key}>
                    <div className="flex items-center justify-between text-[12.5px]">
                      <Text as="span" size="sm" color="muted">
                        {group.label} · {group.total}
                      </Text>
                      <Text as="span" size="sm" weight="medium">
                        {groupValue(group)}
                      </Text>
                    </div>
                    {group.responseRate !== null && (
                      <Meter
                        variant="inline"
                        value={Math.round(group.responseRate * 100)}
                      />
                    )}
                  </VStack>
                ))}
              </VStack>
            )}
            <Text
              size="sm"
              color="muted"
              className="border-t border-border pt-3"
            >
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
