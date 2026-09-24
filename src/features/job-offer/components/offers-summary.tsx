import type * as React from 'react';
import type { OfferWithApplication } from '@/features/job-offer/types';

import {
  RECOMMENDED_ACTION_TIER,
  TIER_LABEL,
} from '@/features/job-offer/components/recommended-action-badge';
import { isTerminalApplicationStatus } from '@/entities/application/types';
import { TierMarker } from '@/entities/job-offer/ui/tier-marker';
import { Card } from '@/shared/ui/card';
import { Meter, Text } from '@/shared/ui/primitives';

// KPI strip + recommendation-mix Meter above the offers list toolbar
// (X-offers.dc.html's "Summary" section). Pure presentational: every number
// is derived from `offers` (the same `visibleOffers` the list renders) plus
// the response-rate readout page.tsx already fetches - no new query.

// Structurally compatible with ResponseRateReadout's overall total/
// responded/minSampleSize fields without importing the type -
// src/features/job-offer must not import src/features/dashboard (ADR-008's
// feature-to-feature isolation).
interface ResponseRateOverall {
  total: number;
  responded: number;
  minSampleSize: number;
}

// Exported for a focused unit test on the threshold/aggregation branch.
export function aggregateResponseRate(
  overall: ResponseRateOverall,
): number | null {
  if (overall.total < overall.minSampleSize) return null;
  return Math.round((overall.responded / overall.total) * 100);
}

// "In progress": tracked and not yet at a terminal outcome (TASK-085) - an
// untracked offer or a closed application isn't still moving.
function isOfferInProgress(offer: OfferWithApplication): boolean {
  return (
    offer.application !== null &&
    !isTerminalApplicationStatus(offer.application.status)
  );
}

// ponytail: "needs action" heuristic (untracked + expired, or untracked +
// the top fit tier) - no per-offer nudge list exists on this screen (that's
// derive-nudges.ts, dashboard-only per TASK-104). Swap for a real nudge
// source if one lands here later.
function isOfferNeedsAction(offer: OfferWithApplication): boolean {
  return (
    offer.application === null &&
    (offer.isExpired || offer.fit?.recommendedAction === 'APPLY_IMMEDIATELY')
  );
}

const MIX_TIERS = [1, 2, 3, 4] as const;
const TIER_FILL: Record<1 | 2 | 3 | 4, string> = {
  1: 'var(--tier-1)',
  2: 'var(--tier-2)',
  3: 'var(--tier-3)',
  4: 'var(--tier-4)',
};
function KpiItem({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="flex flex-col justify-center gap-0.5 border-l border-border pl-4 first:border-l-0 first:pl-0">
      <Text size="xs" color="muted">
        {label}
      </Text>
      <Text
        as="span"
        weight="medium"
        className={`font-mono text-xl leading-6 tabular-nums ${valueClassName ?? ''}`}
      >
        {value}
      </Text>
    </div>
  );
}

export function OffersSummary({
  offers,
  responseRateOverall,
  medianDaysToFirstReply,
}: {
  offers: OfferWithApplication[];
  // null on Free (EntitlementError, same catch page.tsx uses for the
  // dashboard's response-rate card) - the strip just omits these two
  // figures rather than throwing.
  responseRateOverall: ResponseRateOverall | null;
  medianDaysToFirstReply: number | null;
}) {
  const inProgressCount = offers.filter(isOfferInProgress).length;
  const needsActionCount = offers.filter(isOfferNeedsAction).length;
  const responseRatePercent = responseRateOverall
    ? aggregateResponseRate(responseRateOverall)
    : null;

  const mixCounts = new Map<1 | 2 | 3 | 4, number>();
  let notScoredCount = 0;
  for (const offer of offers) {
    if (!offer.fit) {
      notScoredCount += 1;
      continue;
    }
    const tier = RECOMMENDED_ACTION_TIER[offer.fit.recommendedAction];
    mixCounts.set(tier, (mixCounts.get(tier) ?? 0) + 1);
  }

  return (
    <Card
      aria-label="Offers summary"
      className="flex flex-col gap-4 px-4 py-3.5 md:flex-row md:items-center"
    >
      <div className="flex shrink-0">
        <KpiItem label="In progress" value={inProgressCount} />
        {responseRatePercent !== null && (
          <KpiItem label="Response rate" value={`${responseRatePercent}%`} />
        )}
        {medianDaysToFirstReply !== null && (
          <KpiItem
            label="Median first reply"
            value={`${Math.round(medianDaysToFirstReply)} days`}
          />
        )}
        <KpiItem
          label="Needs action"
          value={needsActionCount}
          valueClassName={needsActionCount > 0 ? 'text-warning' : undefined}
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2 border-t border-border pt-3 md:border-t-0 md:border-l md:pt-0 md:pl-6">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Recommendation mix</span>
          <span className="font-mono tabular-nums">{offers.length} offers</span>
        </div>
        {/* Meter renders its segments aria-hidden (no single "current
            value" makes sense for a stacked bar) - the accessible name
            lives on this wrapper instead, matching X-offers.dc.html's
            role="img" summary. */}
        <div
          role="img"
          aria-label={[
            ...MIX_TIERS.map(
              (tier) => `${mixCounts.get(tier) ?? 0} ${TIER_LABEL[tier].toLowerCase()}`,
            ),
            `${notScoredCount} not scored`,
          ].join(', ')}
        >
          <Meter
            max={offers.length || 1}
            segments={[
              ...MIX_TIERS.map((tier) => ({
                value: mixCounts.get(tier) ?? 0,
                colorVar: TIER_FILL[tier],
              })),
              { value: notScoredCount, colorVar: 'var(--border-default)' },
            ]}
          />
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {MIX_TIERS.map((tier) => (
            <TierMarker key={tier} tier={tier}>
              {TIER_LABEL[tier]}{' '}
              <span className="tabular-nums text-muted-foreground">
                {mixCounts.get(tier) ?? 0}
              </span>
            </TierMarker>
          ))}
          <TierMarker tier={null}>
            Not scored{' '}
            <span className="tabular-nums text-muted-foreground">
              {notScoredCount}
            </span>
          </TierMarker>
        </div>
      </div>
    </Card>
  );
}
