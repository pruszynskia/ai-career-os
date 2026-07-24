import { notFound } from 'next/navigation';

import { jobOfferService } from '@/entities/job-offer/service';
import { OfferDetailPanel } from '@/widgets/offer-detail-panel/offer-detail-panel';

export const dynamic = 'force-dynamic';

export default async function OfferPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await jobOfferService.findWithLatestTailoredCv(id);

  if (!result) notFound();

  return (
    <OfferDetailPanel
      offer={result.offer}
      latestTailoredCv={result.latestTailoredCv}
    />
  );
}
