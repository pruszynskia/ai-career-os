import 'server-only';

import { applicationService } from '@/entities/application/service';
import type { ApplicationBundle } from '@/entities/application/types';
import { jobOfferService } from '@/entities/job-offer/service';
import type { OfferSortOption } from '@/entities/job-offer/types';
import type { OfferWithApplication } from '@/features/job-offer/types';
import { getOwnerId } from '@/shared/auth/session';

// Reuses the existing job_offers/applications relationship: fetches the
// owner's offers (with TASK-040's search/sort/favorites filters) and their
// applications, then annotates each offer with its application, if any.
//
// ponytail: joins in JS and over-fetches — applicationService.findMany
// embeds job_offer + full sent_cv content the list never uses, and each
// tracked offer is fetched twice (once here, once via the embed). Fine at
// single-user scale; narrow the select or move to a SQL view if the offer
// count grows large.
export async function listOffersWithApplication(
  filter: { query?: string; favoritesOnly?: boolean },
  opts?: { sort?: OfferSortOption },
): Promise<OfferWithApplication[]> {
  const ownerId = await getOwnerId();
  const [offers, applications] = await Promise.all([
    jobOfferService.findMany(
      {
        ownerId,
        query: filter.query,
        isFavorite: filter.favoritesOnly || undefined,
      },
      opts,
    ),
    applicationService.findMany({ ownerId }),
  ]);

  // ponytail: no unique constraint on applications(job_offer_id) and no
  // duplicate guard in createApplication, so an offer can carry several.
  // findMany orders updated_at desc → keep-first keeps the most recent.
  const applicationByOfferId = new Map<string, ApplicationBundle>();
  for (const application of applications) {
    if (!applicationByOfferId.has(application.jobOfferId)) {
      applicationByOfferId.set(application.jobOfferId, application);
    }
  }

  return offers.map((offer) => ({
    ...offer,
    application: applicationByOfferId.get(offer.id) ?? null,
  }));
}
