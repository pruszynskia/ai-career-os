import 'server-only';

import { applicationService } from '@/entities/application/service';
import { cvDocumentService } from '@/entities/cv-document/service';
import { getOfferOrThrow, jobOfferService } from '@/entities/job-offer/service';
import { getOwnerId } from '@/shared/auth/session';

export class OfferHasApplicationError extends Error {
  constructor() {
    super(
      'This offer has a tracked application. Delete the application first.',
    );
    this.name = 'OfferHasApplicationError';
  }
}

export async function deleteOffer(id: string): Promise<void> {
  const ownerId = await getOwnerId();
  await getOfferOrThrow(id);

  if (await applicationService.existsForOffer(ownerId, id)) {
    throw new OfferHasApplicationError();
  }

  // ponytail: two sequential deletes, not one transaction — if the second
  // fails the tailored docs are already gone. Fine for a single-writer app;
  // move to a Postgres RPC / ON DELETE CASCADE if it ever matters.
  await cvDocumentService.deleteByJobOffer(id);
  await jobOfferService.delete(id);
}
