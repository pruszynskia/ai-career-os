import 'server-only';

import { applicationService } from '@/entities/application/service';
import { cvDocumentService } from '@/entities/cv-document/service';
import { getOfferOrThrow } from '@/features/job-offer/services/get-offer';
import { SEED_OWNER_ID } from '@/shared/auth/owner';

export { OfferNotFoundError } from '@/features/job-offer/services/toggle-favorite.service';

export class CvNotFoundError extends Error {
  constructor() {
    super('CV not found.');
    this.name = 'CvNotFoundError';
  }
}

export async function createApplication(input: {
  jobOfferId: string;
  sentCvId: string;
  recruiterMessage: string;
}) {
  const offer = await getOfferOrThrow(input.jobOfferId);

  const sentCv = await cvDocumentService.findFirst({
    where: { id: input.sentCvId, ownerId: SEED_OWNER_ID },
  });
  if (!sentCv || sentCv.jobOfferId !== offer.id) throw new CvNotFoundError();

  return applicationService.create({
    data: {
      ownerId: SEED_OWNER_ID,
      jobOfferId: offer.id,
      sentCvId: sentCv.id,
      recruiterMessage: input.recruiterMessage,
    },
  });
}
