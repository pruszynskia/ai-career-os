import 'server-only';

import { applicationService } from '@/entities/application/service';
import { cvDocumentService } from '@/entities/cv-document/service';
import { getOfferOrThrow, jobOfferService } from '@/entities/job-offer/service';
import { outreachMessageService } from '@/entities/outreach-message/service';
import { getOwnerId } from '@/shared/auth/session';

export async function deleteOffer(id: string): Promise<void> {
  const ownerId = await getOwnerId();
  await getOfferOrThrow(id);

  // ponytail: sequential deletes, not one transaction — if a later one
  // fails, earlier deletes already happened. Fine for a single-writer app;
  // move to a Postgres RPC / ON DELETE CASCADE if it ever matters.
  // The application goes first: it references the offer and its sent CV.
  // Its status events cascade.
  await applicationService.deleteByJobOffer(ownerId, id);
  await cvDocumentService.deleteByJobOffer(id);
  await outreachMessageService.deleteByJobOffer(id);
  await jobOfferService.delete(id);
}
