import 'server-only';

import { prisma } from '@/shared/db/client';
import { SEED_OWNER_ID } from '@/shared/auth/owner';

export const jobOfferService = prisma.jobOffer;

export class OfferNotFoundError extends Error {
  constructor() {
    super('Offer not found.');
    this.name = 'OfferNotFoundError';
  }
}

export async function getOfferOrThrow(id: string) {
  const offer = await jobOfferService.findFirst({
    where: { id, ownerId: SEED_OWNER_ID },
  });

  if (!offer) throw new OfferNotFoundError();

  return offer;
}
