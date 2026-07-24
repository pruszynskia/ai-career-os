import 'server-only';

import type { JobOffer } from '@/entities/job-offer/types';

import { applicationService } from '@/entities/application/service';
import type { ApplicationBundle } from '@/entities/application/types';
import { jobOfferService } from '@/entities/job-offer/service';
import { getOwnerId } from '@/shared/auth/session';

export async function searchApplicationsAndOffers(query?: string): Promise<{
  applications: ApplicationBundle[];
  offers: JobOffer[];
}> {
  const ownerId = await getOwnerId();
  const [applications, offers] = await Promise.all([
    applicationService.findManyWithOfferSearch(ownerId, query),
    jobOfferService.findUnapplied(ownerId, query),
  ]);

  return { applications, offers };
}
