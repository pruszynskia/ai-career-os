'use client';

import Link from 'next/link';
import { Fragment, useState } from 'react';
import { Star } from 'lucide-react';

import type { OfferWithApplication } from '@/features/job-offer/types';
import { APPLICATION_STATUS_LABELS } from '@/entities/application/types';
import { StageRing } from '@/entities/application/ui/stage-ring';
import {
  RECOMMENDED_ACTION_TIER,
  TIER_LABEL,
} from '@/features/job-offer/components/recommended-action-badge';
import { useToggleFavorite } from '@/features/job-offer/hooks/use-toggle-favorite';
import {
  GridTable,
  GridTableGroupHeader,
  GridTableHead,
  GridTableRow,
  GridTableShowMore,
  gridTableNumericCellClassName,
} from '@/shared/ui/grid-table';
import { Meter, Tag } from '@/shared/ui/primitives';
import { cn } from '@/shared/ui/utils';
import { EmptyState } from '@/shared/ui/empty-state';

const COLUMNS = '20px minmax(0,1fr) 130px 96px 64px 140px 64px';
// Rows shown per tier group before "Show N more" - keeps a long "Consider"
// bucket from pushing every other group off screen.
const VISIBLE_PER_GROUP = 5;

const TIER_ORDER: (1 | 2 | 3 | 4 | null)[] = [1, 2, 3, 4, null];

interface OfferTierGroup {
  tier: 1 | 2 | 3 | 4 | null;
  offers: OfferWithApplication[];
}

// Exported for a focused unit test on the grouping/ordering logic.
export function groupOffersByTier(
  offers: OfferWithApplication[],
): OfferTierGroup[] {
  const buckets = new Map<1 | 2 | 3 | 4 | null, OfferWithApplication[]>();
  for (const offer of offers) {
    const tier = offer.fit
      ? RECOMMENDED_ACTION_TIER[offer.fit.recommendedAction]
      : null;
    const bucket = buckets.get(tier) ?? [];
    bucket.push(offer);
    buckets.set(tier, bucket);
  }
  return TIER_ORDER.map((tier) => ({ tier, offers: buckets.get(tier) ?? [] })).filter(
    (group) => group.offers.length > 0,
  );
}

function average(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function groupMeta(
  offers: OfferWithApplication[],
  tier: 1 | 2 | 3 | 4 | null,
): string | undefined {
  if (tier === null) return 'Match not calculated yet';

  const matches = offers
    .map((offer) => offer.matchScore)
    .filter((score): score is number => score !== null);
  const callbacks = offers
    .map((offer) => offer.fit?.hrCallbackProbability)
    .filter((score): score is number => score !== undefined);
  if (matches.length === 0 && callbacks.length === 0) return undefined;

  const parts: string[] = [];
  if (matches.length > 0) parts.push(`avg match ${Math.round(average(matches))}`);
  if (callbacks.length > 0) parts.push(`callback ${Math.round(average(callbacks))}`);
  return parts.join(' · ');
}

// One row per offer, grouped by fit tier through GridTable (TASK-097/105) -
// replaces the previous flat card list. Per-offer actions that used to live
// inline (status change, delete, download sent CV) now live on the offer
// detail page only (`offer-detail.tsx` already has favorite/delete) -
// matching X-offers.dc.html's compact row, which carries no such controls
// either; a quick-glance preview pane is TASK-106's job, not this one.
export function UnifiedOfferList({
  offers,
  isFiltered = false,
  canViewFitDetail = true,
}: {
  offers: OfferWithApplication[];
  // Fit detail (recommended action, callback probability) is Pro-only
  // (TASK-088) - offers arrive with fit already stripped for Free, so this
  // only decides whether to surface the upgrade prompt in its place.
  canViewFitDetail?: boolean;
  isFiltered?: boolean;
}) {
  const favoriteMutation = useToggleFavorite();
  const [collapsedTiers, setCollapsedTiers] = useState<Set<string>>(new Set());
  const [expandedTiers, setExpandedTiers] = useState<Set<string>>(new Set());

  if (offers.length === 0) {
    return (
      <EmptyState
        message={
          isFiltered
            ? 'No offers match your filters.'
            : 'No offers yet — add one above.'
        }
      />
    );
  }

  const groups = groupOffersByTier(offers);

  return (
    <div className="flex flex-col gap-2">
      {!canViewFitDetail && (
        <p className="px-1 text-sm text-muted-foreground">
          See the recommended action and callback probability for every offer on{' '}
          <Link href="/pricing" className="underline">
            Pro
          </Link>
          .
        </p>
      )}
      <GridTable columns={COLUMNS}>
        <GridTableHead>
          <span aria-hidden="true" />
          <span>Role</span>
          <span>Company</span>
          <span>Match</span>
          <span className={gridTableNumericCellClassName}>Callback</span>
          <span>Stage</span>
          <span className={gridTableNumericCellClassName}>Updated</span>
        </GridTableHead>
        {groups.map(({ tier, offers: groupOffers }) => {
          const key = String(tier);
          const collapsed = collapsedTiers.has(key);
          const expanded = expandedTiers.has(key);
          const visibleOffers = expanded
            ? groupOffers
            : groupOffers.slice(0, VISIBLE_PER_GROUP);
          const remaining = groupOffers.length - visibleOffers.length;

          return (
            <Fragment key={key}>
              <GridTableGroupHeader
                tier={tier}
                label={tier === null ? 'Not scored' : TIER_LABEL[tier]}
                count={groupOffers.length}
                meta={groupMeta(groupOffers, tier)}
                collapsed={collapsed}
                onCollapsedChange={(next) =>
                  setCollapsedTiers((prev) => {
                    const copy = new Set(prev);
                    if (next) copy.add(key);
                    else copy.delete(key);
                    return copy;
                  })
                }
              />
              {!collapsed &&
                visibleOffers.map((offer) => {
                  const isTogglingThis =
                    favoriteMutation.isPending &&
                    favoriteMutation.variables?.id === offer.id;

                  return (
                    <GridTableRow key={offer.id}>
                      <button
                        type="button"
                        aria-label={
                          offer.isFavorite
                            ? 'Remove from favorites'
                            : 'Add to favorites'
                        }
                        aria-pressed={offer.isFavorite}
                        disabled={isTogglingThis}
                        onClick={() =>
                          favoriteMutation.mutate({
                            id: offer.id,
                            isFavorite: !offer.isFavorite,
                          })
                        }
                        className={cn(
                          'flex size-4 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50',
                          offer.isFavorite && 'text-foreground',
                        )}
                      >
                        <Star
                          aria-hidden="true"
                          className={cn(
                            'size-3.5',
                            offer.isFavorite && 'fill-current',
                          )}
                        />
                      </button>
                      <span className="flex min-w-0 items-center gap-2">
                        <Link
                          href={`/offers/${offer.id}`}
                          className="truncate font-medium hover:underline"
                        >
                          {offer.title}
                        </Link>
                        {offer.isExpired && <Tag size="sm">Expired</Tag>}
                      </span>
                      <span className="truncate text-muted-foreground">
                        {offer.company}
                      </span>
                      {offer.matchScore !== null ? (
                        <span className="flex items-center gap-2">
                          <Meter
                            variant="inline"
                            value={offer.matchScore}
                            className="w-10"
                          />
                          <span className={gridTableNumericCellClassName}>
                            {offer.matchScore}
                          </span>
                        </span>
                      ) : (
                        <span className={gridTableNumericCellClassName}>—</span>
                      )}
                      <span className={gridTableNumericCellClassName}>
                        {offer.fit ? offer.fit.hrCallbackProbability : '—'}
                      </span>
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <StageRing status={offer.application?.status ?? null} />
                        {offer.application
                          ? APPLICATION_STATUS_LABELS[offer.application.status]
                          : 'Not tracked'}
                      </span>
                      <span className={gridTableNumericCellClassName}>
                        {offer.updatedAt.toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </GridTableRow>
                  );
                })}
              {!collapsed && remaining > 0 && (
                <GridTableShowMore
                  count={remaining}
                  onClick={() =>
                    setExpandedTiers((prev) => new Set(prev).add(key))
                  }
                />
              )}
            </Fragment>
          );
        })}
      </GridTable>
    </div>
  );
}
