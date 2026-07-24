import 'server-only';

import { jobOfferService } from '@/entities/job-offer/service';
import { SEED_OWNER_ID } from '@/shared/auth/owner';

export class OfferNotFoundError extends Error {
  constructor() {
    super('Offer not found.');
    this.name = 'OfferNotFoundError';
  }
}

export async function toggleFavorite(id: string, isFavorite: boolean) {
  const existing = await jobOfferService.findFirst({
    where: { id, ownerId: SEED_OWNER_ID },
  });

  if (!existing) throw new OfferNotFoundError();

  return jobOfferService.update({
    where: { id },
    data: { isFavorite },
  });
}
