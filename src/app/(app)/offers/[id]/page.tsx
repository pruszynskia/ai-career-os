import { notFound } from 'next/navigation';

import { cvDocumentService } from '@/entities/cv-document/service';
import { jobOfferService } from '@/entities/job-offer/service';
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
  const [result, masterCv] = await Promise.all([
    jobOfferService.findWithLatestTailoredCv(id),
    cvDocumentService.findFirst({ ownerId, isMaster: true, kind: 'MASTER' }),
  ]);

  if (!result) notFound();

  return (
    <OfferDetailPanel
      offer={result.offer}
      latestTailoredCv={result.latestTailoredCv}
      masterCv={masterCv ?? undefined}
    />
  );
}
