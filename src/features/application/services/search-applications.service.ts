import 'server-only';

import type { JobOffer } from '@prisma/client';

import { applicationService } from '@/entities/application/service';
import type { ApplicationBundle } from '@/entities/application/types';
import { jobOfferService } from '@/entities/job-offer/service';
import { SEED_OWNER_ID } from '@/shared/auth/owner';

function offerMatch(query?: string) {
  if (!query) return {};
  return {
    OR: [
      { title: { contains: query, mode: 'insensitive' as const } },
      { company: { contains: query, mode: 'insensitive' as const } },
    ],
  };
}

export async function searchApplicationsAndOffers(query?: string): Promise<{
  applications: ApplicationBundle[];
  offers: JobOffer[];
}> {
  const [applications, offers] = await Promise.all([
    applicationService.findMany({
      where: { ownerId: SEED_OWNER_ID, jobOffer: offerMatch(query) },
      include: { jobOffer: true, sentCv: true },
      orderBy: { createdAt: 'desc' },
    }),
    jobOfferService.findMany({
      where: {
        ownerId: SEED_OWNER_ID,
        applications: { none: {} },
        ...offerMatch(query),
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return { applications, offers };
}
