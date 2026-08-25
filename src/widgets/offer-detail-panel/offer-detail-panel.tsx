'use client';

import type { CvDocument } from '@/entities/cv-document/types';
import type { JobOffer } from '@/entities/job-offer/types';

import { useCreateApplication } from '@/features/application/hooks/use-create-application';
import { OfferDetail } from '@/features/job-offer/components/offer-detail';

export function OfferDetailPanel({
  offer,
  latestTailoredCv,
}: {
  offer: JobOffer;
  latestTailoredCv?: CvDocument;
}) {
  const createApplicationMutation = useCreateApplication();

  return (
    <OfferDetail
      offer={offer}
      latestTailoredCv={latestTailoredCv}
      onTrackApplication={(input, options) =>
        createApplicationMutation.mutate(input, options)
      }
      isTrackingApplication={createApplicationMutation.isPending}
    />
  );
}
