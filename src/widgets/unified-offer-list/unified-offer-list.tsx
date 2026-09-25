'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Fragment, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Star, X } from 'lucide-react';

import type { OfferWithApplication } from '@/features/job-offer/types';
import { APPLICATION_STATUS_LABELS } from '@/entities/application/types';
import { StageRing } from '@/entities/application/ui/stage-ring';
import {
  RECOMMENDED_ACTION_TIER,
  RecommendedActionBadge,
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
import {
  Button,
  Heading,
  IconButton,
  Meter,
  Tag,
} from '@/shared/ui/primitives';
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

// Exported for a focused unit test (TASK-127): the mobile row's tap target
// and its "back" link both depend on this forwarding the list's own q/sort/
// favorite params to the full-page preview route unchanged.
export function buildOfferPreviewHref(
  offerId: string,
  searchParams: URLSearchParams,
): string {
  const previewParams = new URLSearchParams();
  for (const key of ['q', 'sort', 'favorite']) {
    const value = searchParams.get(key);
    if (value) previewParams.set(key, value);
  }
  const previewQuery = previewParams.toString();
  return `/offers/${offerId}/preview${previewQuery ? `?${previewQuery}` : ''}`;
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
  return TIER_ORDER.map((tier) => ({
    tier,
    offers: buckets.get(tier) ?? [],
  })).filter((group) => group.offers.length > 0);
}

// Shared by both the mobile row and the desktop GridTableRow below - same
// star toggle, same aria-label/aria-pressed, just a `shrink-0` the desktop
// grid layout doesn't need. One copy so the two rows can't drift apart.
function OfferFavoriteButton({
  offer,
  isPending,
  onToggle,
  className,
}: {
  offer: OfferWithApplication;
  isPending: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={
        offer.isFavorite ? 'Remove from favorites' : 'Add to favorites'
      }
      aria-pressed={offer.isFavorite}
      disabled={isPending}
      onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}
      className={cn(
        'flex size-4 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50',
        offer.isFavorite && 'text-foreground',
        className,
      )}
    >
      <Star
        aria-hidden="true"
        className={cn('size-3.5', offer.isFavorite && 'fill-current')}
      />
    </button>
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
  if (matches.length > 0)
    parts.push(`avg match ${Math.round(average(matches))}`);
  if (callbacks.length > 0)
    parts.push(`callback ${Math.round(average(callbacks))}`);
  return parts.join(' · ');
}

// 344px preview pane (TASK-106) - fixed side pane at desktop widths,
// overlay drawer at the 768-1279 tablet breakpoint (tokens.json's
// breakpoint.rules, same pattern as the sidebar's icon-collapse in
// nav/sidebar.tsx). Built entirely from the offer object the page already
// fetched - no per-offer fetch on selection.
//
// Below 768 (TASK-127) this same content is reused (exported) for a real
// `offers/[id]/preview` page instead of an in-place pane - that route's
// page.tsx is a Server Component, so it renders this Client Component with
// `closeHref` (a Link-based back button) instead of an `onClose` callback,
// which can't cross the server/client boundary.
export function OfferPreviewPane({
  offer,
  canViewFitDetail,
  onClose,
  closeHref,
}: {
  offer: OfferWithApplication;
  canViewFitDetail: boolean;
  onClose?: () => void;
  closeHref?: string;
}) {
  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="flex items-start gap-2 border-b border-border px-4 py-3.5">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-muted-foreground">
            {offer.company}
          </p>
          <Heading level={3} as="h2" className="mt-1 truncate">
            {offer.title}
          </Heading>
        </div>
        <IconButton
          variant="quiet"
          size="sm"
          aria-label={closeHref ? 'Back to offers' : 'Close preview'}
          onClick={onClose}
          asChild={Boolean(closeHref)}
        >
          {closeHref ? (
            <Link href={closeHref}>
              <ArrowLeft className="size-[13px]" />
            </Link>
          ) : (
            <X className="size-[13px]" />
          )}
        </IconButton>
      </div>
      <div className="flex flex-col gap-3 px-4 py-3.5">
        <p className="text-xs text-muted-foreground">
          Added{' '}
          {offer.createdAt.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
          })}
          {offer.expiresAt &&
            ` · Expires ${offer.expiresAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`}
          {offer.isExpired && ' · Expired'}
        </p>
        <div className="grid grid-cols-2 rounded-md border border-border">
          <div className="flex flex-col gap-0.5 p-3">
            <span className="text-xs text-muted-foreground">Match</span>
            <span className="font-mono text-xl tabular-nums">
              {offer.matchScore ?? '—'}
            </span>
          </div>
          {canViewFitDetail && (
            <div className="flex flex-col gap-0.5 border-l border-border p-3">
              <span className="text-xs text-muted-foreground">Callback</span>
              <span className="font-mono text-xl tabular-nums">
                {offer.fit ? offer.fit.hrCallbackProbability : '—'}
              </span>
            </div>
          )}
        </div>
        {canViewFitDetail && offer.fit && (
          <RecommendedActionBadge action={offer.fit.recommendedAction} />
        )}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <StageRing status={offer.application?.status ?? null} />
          {offer.application
            ? APPLICATION_STATUS_LABELS[offer.application.status]
            : 'Not tracked'}
        </div>
      </div>
      <div className="mt-auto border-t border-border px-4 py-3.5">
        <Button asChild size="sm" className="w-full">
          <Link href={`/offers/${offer.id}`}>View full offer</Link>
        </Button>
      </div>
    </div>
  );
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const favoriteMutation = useToggleFavorite();
  const [collapsedTiers, setCollapsedTiers] = useState<Set<string>>(new Set());
  const [expandedTiers, setExpandedTiers] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedOffer = offers.find((offer) => offer.id === selectedId) ?? null;
  const paneRef = useRef<HTMLElement>(null);
  // Below 1280px the pane is an overlay (drawer or full-page) on top of the
  // list/tab bar, so it needs real dialog semantics + a focus trap; at
  // 1280px+ it's an inline sticky panel next to a still-usable list, so
  // trapping focus there would break Tab-ing through the table.
  const [isOverlay, setIsOverlay] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(max-width: 1279px)').matches,
  );

  useEffect(() => {
    const query = window.matchMedia('(max-width: 1279px)');
    const onChange = (event: MediaQueryListEvent) =>
      setIsOverlay(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  // Below 768 this pane/drawer is `hidden` (TASK-127 routes to a full page
  // instead) - if a resize crosses that breakpoint while a desktop/tablet
  // selection is open, drop it so the Escape/Tab-trap listener below doesn't
  // keep running against a now-hidden pane.
  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)');
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setSelectedId(null);
    };
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  // Escape closes the preview (drawer/full-page overlay and the desktop
  // pane alike), and opening one moves focus into it so keyboard/AT users
  // aren't left behind on a row that's now covered by the pane. Re-runs on
  // selectedId only (not the offer object) so a favorite toggle's
  // router.refresh() - which rebuilds `offers` with new identities - doesn't
  // yank focus back into an already-open pane.
  useEffect(() => {
    if (!selectedId) return;
    paneRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedId(null);
        return;
      }
      // Trap Tab inside the pane while it's an overlay - otherwise focus can
      // move into list/tab-bar content still visible only behind the scrim.
      if (event.key !== 'Tab' || !isOverlay) return;
      const pane = paneRef.current;
      if (!pane) return;
      const focusable = pane.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [selectedId, isOverlay]);

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
      {/* Below 768 (TASK-127): single-column list with sticky tier headers
        and stage chips, per X-m-offers.dc.html - replaces the GridTable and
        routes a tap to a full preview page instead of TASK-106's pane. */}
      <div className="md:hidden">
        {groups.map(({ tier, offers: groupOffers }) => {
          const key = String(tier);
          const collapsed = collapsedTiers.has(key);
          const expanded = expandedTiers.has(key);
          const visibleOffers = expanded
            ? groupOffers
            : groupOffers.slice(0, VISIBLE_PER_GROUP);
          const remaining = groupOffers.length - visibleOffers.length;

          return (
            // Each tier group is its own `relative` box (not a bare
            // Fragment) so `sticky top-0` on its header only sticks for the
            // height of this group - once the group scrolls past, the
            // header leaves with it instead of stacking on top of the next
            // group's header.
            <div key={key} className="relative">
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
                className="sticky top-0 z-10"
              />
              {!collapsed &&
                visibleOffers.map((offer) => {
                  const isTogglingThis =
                    favoriteMutation.isPending &&
                    favoriteMutation.variables?.id === offer.id;
                  const previewHref = buildOfferPreviewHref(
                    offer.id,
                    searchParams,
                  );

                  return (
                    // No role="button"/tabIndex/onKeyDown here (matches the
                    // desktop GridTableRow convention below): the row is
                    // mouse-clickable to open the preview, while the
                    // favorite button and title Link stay the only keyboard
                    // targets - avoids nesting a button/link inside a
                    // role="button" and the keydown-bubbling bug that came
                    // with it.
                    <div
                      key={offer.id}
                      onClick={() => router.push(previewHref)}
                      className="flex cursor-pointer items-center gap-3 border-b border-border px-4 py-2.5 hover:bg-muted"
                    >
                      <OfferFavoriteButton
                        offer={offer}
                        isPending={isTogglingThis}
                        onToggle={() =>
                          favoriteMutation.mutate({
                            id: offer.id,
                            isFavorite: !offer.isFavorite,
                          })
                        }
                        className="shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/offers/${offer.id}`}
                            onClick={(event) => event.stopPropagation()}
                            className="truncate font-medium hover:underline"
                          >
                            {offer.title}
                          </Link>
                          {offer.isExpired && <Tag size="sm">Expired</Tag>}
                        </div>
                        <p className="truncate text-xs text-muted-foreground">
                          {offer.company}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <span className="font-mono text-xs tabular-nums text-muted-foreground">
                          {offer.matchScore ?? '—'}
                          {offer.fit && ` · ${offer.fit.hrCallbackProbability}`}
                        </span>
                        <Tag size="sm" className="gap-1.5">
                          <StageRing
                            status={offer.application?.status ?? null}
                          />
                          {offer.application
                            ? APPLICATION_STATUS_LABELS[
                                offer.application.status
                              ]
                            : 'Not tracked'}
                        </Tag>
                      </div>
                    </div>
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
            </div>
          );
        })}
      </div>
      {/* 768+ (TASK-105/106): GridTable with an inline pane (1280+) or an
        overlay drawer (768-1279). */}
      <div className="hidden items-start gap-4 md:flex">
        <div className="min-w-0 flex-1">
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
                        <GridTableRow
                          key={offer.id}
                          selected={offer.id === selectedId}
                          onClick={() => setSelectedId(offer.id)}
                          className="cursor-pointer"
                        >
                          <OfferFavoriteButton
                            offer={offer}
                            isPending={isTogglingThis}
                            onToggle={() =>
                              favoriteMutation.mutate({
                                id: offer.id,
                                isFavorite: !offer.isFavorite,
                              })
                            }
                          />
                          <span className="flex min-w-0 items-center gap-2">
                            <Link
                              href={`/offers/${offer.id}`}
                              onClick={(event) => event.stopPropagation()}
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
                            <span className={gridTableNumericCellClassName}>
                              —
                            </span>
                          )}
                          <span className={gridTableNumericCellClassName}>
                            {offer.fit ? offer.fit.hrCallbackProbability : '—'}
                          </span>
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <StageRing
                              status={offer.application?.status ?? null}
                            />
                            {offer.application
                              ? APPLICATION_STATUS_LABELS[
                                  offer.application.status
                                ]
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
        {selectedOffer && (
          <>
            {/* Tablet-only (768-1279) scrim behind the drawer - the pane
              itself is `fixed` only in that same range (see below); at and
              above 1280 it's inline, not an overlay. This whole container is
              `hidden` below 768 (TASK-127 routes to a full page there
              instead), so no mobile-specific styling is needed here. */}
            <div
              aria-hidden="true"
              onClick={() => setSelectedId(null)}
              className="fixed inset-0 z-40 hidden bg-[var(--scrim)] min-[768px]:max-[1279px]:block"
            />
            <aside
              ref={paneRef}
              tabIndex={-1}
              // Only the tablet drawer (768-1279) is a real modal - the
              // inline 1280px+ pane sits beside a still-interactive list, so
              // it keeps neither role nor aria-modal.
              role={isOverlay ? 'dialog' : undefined}
              aria-modal={isOverlay ? true : undefined}
              aria-label={`Preview: ${selectedOffer.title} at ${selectedOffer.company}`}
              className="flex w-full shrink-0 border-l border-border bg-popover outline-none min-[768px]:max-[1279px]:fixed min-[768px]:max-[1279px]:inset-y-0 min-[768px]:max-[1279px]:right-0 min-[768px]:max-[1279px]:z-50 min-[768px]:max-[1279px]:w-[344px] min-[768px]:max-[1279px]:shadow-[var(--shadow-overlay)] min-[1280px]:sticky min-[1280px]:top-4 min-[1280px]:w-[344px] min-[1280px]:max-h-[calc(100vh-2rem)]"
            >
              <OfferPreviewPane
                offer={selectedOffer}
                canViewFitDetail={canViewFitDetail}
                onClose={() => setSelectedId(null)}
              />
            </aside>
          </>
        )}
      </div>
    </div>
  );
}
