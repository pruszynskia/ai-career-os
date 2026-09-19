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
import { getPlanForOwner, meetsPlan } from '@/shared/billing/entitlements';
import { OfferDetailPanel } from '@/widgets/offer-detail-panel/offer-detail-panel';

export const dynamic = 'force-dynamic';

export default async function OfferPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ownerId = await getOwnerId();
  // getPlanForOwner never throws (unlike requirePlan) - it just resolves to
  // Free, which is what a page render wants: matchScore/CV/posts stay free
  // (TASK-088) even when the fit report detail and the tailoring report
  // - both gated behind the same 'pro' check - aren't shown.
  const [result, masterCv, application, profile, plan] = await Promise.all([
    jobOfferService.findWithLatestTailoredCv(id),
    cvDocumentService.findFirst({ ownerId, isMaster: true, kind: 'MASTER' }),
    applicationService.findByOffer(ownerId, id),
    profileService.findUnique(ownerId),
    getPlanForOwner(ownerId),
  ]);
  const canViewFitDetail = meetsPlan(plan, 'pro');
  const canViewTailoringReport = meetsPlan(plan, 'pro');

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

  // Strip the gated payloads before they're serialized into OfferDetailPanel's
  // ('use client') props - matchScore and the tailored CV content stay free,
  // but the fit criteria breakdown and the tailoring report itself must not
  // reach a Free account's page source (TASK-088 fix).
  const offer = canViewFitDetail
    ? result.offer
    : { ...result.offer, fit: null };
  const latestTailoredCv =
    result.latestTailoredCv && !canViewTailoringReport
      ? { ...result.latestTailoredCv, tailoringReport: null }
      : result.latestTailoredCv;

  return (
    <OfferDetailPanel
      offer={offer}
      latestTailoredCv={latestTailoredCv}
      masterCv={masterCv ?? undefined}
      statusEvents={statusEvents}
      application={application}
      evidence={profile?.evidence ?? EMPTY_EVIDENCE_BASE}
      contacts={contacts}
      interlockWarning={interlockWarning}
      canViewFitDetail={canViewFitDetail}
      canViewTailoringReport={canViewTailoringReport}
    />
  );
}
