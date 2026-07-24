import 'server-only';

import { jobOfferService } from '@/entities/job-offer/service';
import { OfferNotFoundError } from '@/features/job-offer/services/toggle-favorite.service';
import { SEED_OWNER_ID } from '@/shared/auth/owner';

export { OfferNotFoundError };

export async function getOfferOrThrow(id: string) {
  const offer = await jobOfferService.findFirst({
    where: { id, ownerId: SEED_OWNER_ID },
  });

  if (!offer) throw new OfferNotFoundError();

  return offer;
}
