import { notFound } from 'next/navigation';

import { jobOfferService } from '@/entities/job-offer/service';
import { SEED_OWNER_ID } from '@/shared/auth/owner';
import { OfferDetailPanel } from '@/widgets/offer-detail-panel/offer-detail-panel';

export const dynamic = 'force-dynamic';

export default async function OfferPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const offer = await jobOfferService.findFirst({
    where: { id, ownerId: SEED_OWNER_ID },
    include: {
      tailoredCvs: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });

  if (!offer) notFound();

  const { tailoredCvs, ...jobOffer } = offer;

  return <OfferDetailPanel offer={jobOffer} latestTailoredCv={tailoredCvs[0]} />;
}
