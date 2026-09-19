import { cvDocumentService } from '@/entities/cv-document/service';
import { offerSortOptions } from '@/entities/job-offer/types';
import { AddOfferForm } from '@/features/job-offer/components/add-offer-form';
import { OfferFilters } from '@/features/job-offer/components/offer-filters';
import { listOffersWithApplication } from '@/features/job-offer/services/list-offers-with-application.service';
import { getOwnerId } from '@/shared/auth/session';
import { getPlanForOwner, meetsPlan } from '@/shared/billing/entitlements';
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
  const [offers, plan] = await Promise.all([
    listOffersWithApplication({ query, favoritesOnly }, { sort: sortOption }),
    getPlanForOwner(ownerId),
  ]);
  // Fit detail (recommended action, callback probability) is Pro-only
  // (TASK-088) - strip it here too, not just on the offer detail page, so
  // the list row can't leak it. matchScore stays free.
  const canViewFitDetail = meetsPlan(plan, 'pro');
  const visibleOffers = canViewFitDetail
    ? offers
    : offers.map((offer) => ({ ...offer, fit: null }));

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
      <AddOfferForm />

      <OfferFilters
        query={query ?? ''}
        sort={sortOption}
        favoritesOnly={favoritesOnly}
        view={viewMode}
      />

      {viewMode === 'board' ? (
        <ApplicationBoard
          offers={visibleOffers}
          isFiltered={Boolean(query) || favoritesOnly}
          masterCvId={masterCv?.id}
        />
      ) : (
        <UnifiedOfferList
          offers={visibleOffers}
          isFiltered={Boolean(query) || favoritesOnly}
          canViewFitDetail={canViewFitDetail}
        />
      )}
    </AppPageLayout>
  );
}
