import { jobOfferService } from '@/entities/job-offer/service';
import { offerSortOptions } from '@/entities/job-offer/types';
import { AddOfferForm } from '@/features/job-offer/components/add-offer-form';
import { OfferFilters } from '@/features/job-offer/components/offer-filters';
import { OfferList } from '@/features/job-offer/components/offer-list';
import { getOwnerId } from '@/shared/auth/session';
import { AppPageLayout } from '@/shared/layouts';

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

  const ownerId = await getOwnerId();
  const offers = await jobOfferService.findMany(
    { ownerId, query, isFavorite: favoritesOnly || undefined },
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

      <OfferList offers={offers} isFiltered={Boolean(query) || favoritesOnly} />
    </AppPageLayout>
  );
}
