import 'server-only';

import { applicationService } from '@/entities/application/service';
import { cvDocumentService } from '@/entities/cv-document/service';
import { canBeSentCv } from '@/entities/cv-document/types';
import { getOfferOrThrow } from '@/entities/job-offer/service';
import { getOwnerId } from '@/shared/auth/session';

export { OfferNotFoundError } from '@/entities/job-offer/service';

export class CvNotFoundError extends Error {
  constructor() {
    super('CV not found.');
    this.name = 'CvNotFoundError';
  }
}

export class ApplicationExistsError extends Error {
  constructor() {
    super('This offer is already tracked.');
    this.name = 'ApplicationExistsError';
  }
}

// Postgres unique_violation — applications_job_offer_id_key lost a race.
const UNIQUE_VIOLATION = '23505';

export async function createApplication(input: {
  jobOfferId: string;
  sentCvId: string;
  recruiterMessage: string;
}) {
  const ownerId = await getOwnerId();
  const offer = await getOfferOrThrow(input.jobOfferId);
  if (await applicationService.findByOffer(ownerId, offer.id)) {
    throw new ApplicationExistsError();
  }

  const sentCv = await cvDocumentService.findFirst({
    id: input.sentCvId,
    ownerId,
  });
  if (!sentCv || !canBeSentCv(sentCv, offer.id)) throw new CvNotFoundError();

  // The APPLIED status event is written by the applications_status_event
  // trigger in the same statement.
  return applicationService
    .create({
      ownerId,
      jobOfferId: offer.id,
      sentCvId: sentCv.id,
      recruiterMessage: input.recruiterMessage,
    })
    .catch((error: { code?: string }) => {
      if (error.code === UNIQUE_VIOLATION) throw new ApplicationExistsError();
      throw error;
    });
}
