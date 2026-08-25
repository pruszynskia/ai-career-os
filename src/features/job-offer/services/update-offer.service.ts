import 'server-only';

import {
  getOfferOrThrow,
  jobOfferService,
  OfferNotFoundError,
} from '@/entities/job-offer/service';

export { OfferNotFoundError };

export async function updateOffer(
  id: string,
  values: Partial<{ company: string; title: string; description: string }>,
) {
  await getOfferOrThrow(id);

  return jobOfferService.update(id, values);
}
