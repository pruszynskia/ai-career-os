import { notFound } from 'next/navigation';

import { applicationService } from '@/entities/application/service';
import { applicationStatusEventService } from '@/entities/application-status-event/service';
import { contactService } from '@/entities/contact/service';
import { cvDocumentService } from '@/entities/cv-document/service';
import { jobOfferService } from '@/entities/job-offer/service';
import { EMPTY_EVIDENCE_BASE } from '@/entities/profile/types';
import { profileService } from '@/entities/profile/service';
import { checkInterlock } from '@/features/contact/services/interlock';
import { getOwnerId } from '@/shared/auth/session';
import { OfferDetailPanel } from '@/widgets/offer-detail-panel/offer-detail-panel';

export const dynamic = 'force-dynamic';

export default async function OfferPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ownerId = await getOwnerId();
  const [result, masterCv, application, profile] = await Promise.all([
    jobOfferService.findWithLatestTailoredCv(id),
    cvDocumentService.findFirst({ ownerId, isMaster: true, kind: 'MASTER' }),
    applicationService.findByOffer(ownerId, id),
    profileService.findUnique(ownerId),
  ]);

  if (!result) notFound();

  const [statusEvents, contacts, interlockWarning] = await Promise.all([
    application
      ? applicationStatusEventService.findMany({
          applicationId: application.id,
        })
      : Promise.resolve([]),
    contactService.findByCompany(ownerId, result.offer.company),
    checkInterlock(ownerId, result.offer.company),
  ]);

  return (
    <OfferDetailPanel
      offer={result.offer}
      latestTailoredCv={result.latestTailoredCv}
      masterCv={masterCv ?? undefined}
      statusEvents={statusEvents}
      application={application}
      evidence={profile?.evidence ?? EMPTY_EVIDENCE_BASE}
      contacts={contacts}
      interlockWarning={interlockWarning}
    />
  );
}
