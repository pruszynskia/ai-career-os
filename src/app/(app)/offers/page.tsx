import { offerSortOptions } from '@/entities/job-offer/types';
import { AddOfferForm } from '@/features/job-offer/components/add-offer-form';
import { OfferFilters } from '@/features/job-offer/components/offer-filters';
import { listOffersWithApplication } from '@/features/job-offer/services/list-offers-with-application.service';
import { AppPageLayout } from '@/shared/layouts';
import { UnifiedOfferList } from '@/widgets/unified-offer-list/unified-offer-list';

export const dynamic = 'force-dynamic';

export default async function OffersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string; favorite?: string }>;
}) {
  const { q, sort, favorite } = await searchParams;
  const query = q?.trim() || undefined;
  const sortOption =
    offerSortOptions.find((option) => option === sort) ?? 'createdAt';
  const favoritesOnly = favorite === '1';

  const offers = await listOffersWithApplication(
    { query, favoritesOnly },
    { sort: sortOption },
  );

  return (
    <AppPageLayout title="Offers">
      <AddOfferForm />

      <OfferFilters
        query={query ?? ''}
        sort={sortOption}
        favoritesOnly={favoritesOnly}
      />

      <UnifiedOfferList
        offers={offers}
        isFiltered={Boolean(query) || favoritesOnly}
      />
    </AppPageLayout>
  );
}
