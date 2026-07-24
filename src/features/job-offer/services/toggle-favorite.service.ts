import 'server-only';

import {
  getOfferOrThrow,
  jobOfferService,
  OfferNotFoundError,
} from '@/entities/job-offer/service';

export { OfferNotFoundError };

export async function toggleFavorite(id: string, isFavorite: boolean) {
  await getOfferOrThrow(id);

  return jobOfferService.update(id, { isFavorite });
}
