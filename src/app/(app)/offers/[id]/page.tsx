import { notFound } from 'next/navigation';

import { jobOfferService } from '@/entities/job-offer/service';
import { OfferDetail } from '@/features/job-offer/components/offer-detail';
import { SEED_OWNER_ID } from '@/shared/auth/owner';

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

  return <OfferDetail offer={jobOffer} latestTailoredCv={tailoredCvs[0]} />;
}
