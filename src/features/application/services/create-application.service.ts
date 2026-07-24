import 'server-only';

import { applicationService } from '@/entities/application/service';
import { cvDocumentService } from '@/entities/cv-document/service';
import { getOfferOrThrow } from '@/entities/job-offer/service';
import { getOwnerId } from '@/shared/auth/session';

export { OfferNotFoundError } from '@/entities/job-offer/service';

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
  const ownerId = await getOwnerId();
  const offer = await getOfferOrThrow(input.jobOfferId);

  const sentCv = await cvDocumentService.findFirst({
    id: input.sentCvId,
    ownerId,
  });
  if (!sentCv || sentCv.jobOfferId !== offer.id) throw new CvNotFoundError();

  return applicationService.create({
    ownerId,
    jobOfferId: offer.id,
    sentCvId: sentCv.id,
    recruiterMessage: input.recruiterMessage,
  });
}
