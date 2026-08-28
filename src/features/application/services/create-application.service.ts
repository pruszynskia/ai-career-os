import 'server-only';

import { applicationService } from '@/entities/application/service';
import { applicationStatusEventService } from '@/entities/application-status-event/service';
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
  if (!sentCv || !canBeSentCv(sentCv, offer.id)) throw new CvNotFoundError();

  const application = await applicationService.create({
    ownerId,
    jobOfferId: offer.id,
    sentCvId: sentCv.id,
    recruiterMessage: input.recruiterMessage,
  });

  // ponytail: history write is best-effort — a failed event must not fail
  // the request that already committed (createApplication has no duplicate
  // guard, so a retry would create a second application). Move both writes
  // into a Postgres RPC if history ever has to be transactional.
  await applicationStatusEventService
    .create({
      ownerId,
      applicationId: application.id,
      status: application.status,
    })
    .catch((error) =>
      console.error('Failed to record the status event', error),
    );

  return application;
}
