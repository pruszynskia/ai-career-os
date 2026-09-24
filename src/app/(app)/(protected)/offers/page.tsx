import { cvDocumentService } from '@/entities/cv-document/service';
import { offerSortOptions } from '@/entities/job-offer/types';
import { OfferFilters } from '@/features/job-offer/components/offer-filters';
import { OffersSummary } from '@/features/job-offer/components/offers-summary';
import { listOffersWithApplication } from '@/features/job-offer/services/list-offers-with-application.service';
import { getResponseRateReadout } from '@/features/dashboard/services/response-rate-readout.service';
import { getOwnerId } from '@/shared/auth/session';
import { getPlanForOwner, meetsPlan } from '@/shared/billing/entitlements';
import { EntitlementError } from '@/shared/billing/errors';
import { AppPageLayout } from '@/shared/layouts';
import { ApplicationBoard } from '@/widgets/application-board/application-board';
import { UnifiedOfferList } from '@/widgets/unified-offer-list/unified-offer-list';

export const dynamic = 'force-dynamic';

export default async function OffersPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    sort?: string;
    favorite?: string;
    view?: string;
  }>;
}) {
  const { q, sort, favorite, view } = await searchParams;
  const query = q?.trim() || undefined;
  const sortOption =
    offerSortOptions.find((option) => option === sort) ?? 'createdAt';
  const favoritesOnly = favorite === '1';
  const viewMode = view === 'board' ? 'board' : 'list';

  const ownerId = await getOwnerId();
  const isFiltered = Boolean(query) || favoritesOnly;
  const [offers, allOffers, plan, responseRateReadout] = await Promise.all([
    listOffersWithApplication({ query, favoritesOnly }, { sort: sortOption }),
    // The KPI strip and mix Meter are account-wide, not a reflection of the
    // current search/favorites filter (page.tsx doesn't otherwise fetch the
    // unfiltered set) - ponytail: a second listOffersWithApplication call
    // rather than replicating its ilike search matching in JS; skip
    // entirely when nothing is filtered.
    isFiltered
      ? listOffersWithApplication({}, { sort: sortOption })
      : Promise.resolve(null),
    getPlanForOwner(ownerId),
    // Free plan: null, not a thrown error - same EntitlementError catch the
    // dashboard's response-rate card uses (TASK-104). OffersSummary below
    // just omits the response-rate/median KPIs in that case.
    getResponseRateReadout(ownerId).catch((error) => {
      if (error instanceof EntitlementError) return null;
      throw error;
    }),
  ]);
  // Fit detail (recommended action, callback probability) is Pro-only
  // (TASK-088) - strip it here too, not just on the offer detail page, so
  // the list row can't leak it. matchScore stays free.
  const canViewFitDetail = meetsPlan(plan, 'pro');
  const stripFit = (list: typeof offers) =>
    canViewFitDetail ? list : list.map((offer) => ({ ...offer, fit: null }));
  const visibleOffers = stripFit(offers);
  const summaryOffers = stripFit(allOffers ?? offers);

  // The board can track an untracked offer on drop; that needs a CV to send.
  // Only the master CV is available without opening the offer detail page.
  const masterCv =
    viewMode === 'board'
      ? await cvDocumentService.findFirst({
          ownerId,
          isMaster: true,
          kind: 'MASTER',
        })
      : null;

  return (
    <AppPageLayout title="Offers">
      {viewMode === 'list' && (
        <OffersSummary
          offers={summaryOffers}
          responseRateOverall={
            responseRateReadout
              ? {
                  total: responseRateReadout.totalConsidered,
                  responded: responseRateReadout.overallResponded,
                  minSampleSize: responseRateReadout.minSampleSize,
                }
              : null
          }
          medianDaysToFirstReply={
            responseRateReadout?.medianDaysToFirstReply ?? null
          }
        />
      )}

      <OfferFilters
        query={query ?? ''}
        sort={sortOption}
        favoritesOnly={favoritesOnly}
        view={viewMode}
      />

      {viewMode === 'board' ? (
        <ApplicationBoard
          offers={visibleOffers}
          isFiltered={isFiltered}
          masterCvId={masterCv?.id}
        />
      ) : (
        <UnifiedOfferList
          offers={visibleOffers}
          isFiltered={isFiltered}
          canViewFitDetail={canViewFitDetail}
        />
      )}
    </AppPageLayout>
  );
}
