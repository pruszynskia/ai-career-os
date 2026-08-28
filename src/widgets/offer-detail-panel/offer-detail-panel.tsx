'use client';

import type { ApplicationStatusEvent } from '@/entities/application-status-event/types';
import type { CvDocument } from '@/entities/cv-document/types';
import type { JobOffer } from '@/entities/job-offer/types';

import { ApplicationTimeline } from '@/features/application/components/application-timeline';
import { useCreateApplication } from '@/features/application/hooks/use-create-application';
import { OfferDetail } from '@/features/job-offer/components/offer-detail';

export function OfferDetailPanel({
  offer,
  latestTailoredCv,
  masterCv,
  statusEvents,
}: {
  offer: JobOffer;
  latestTailoredCv?: CvDocument;
  masterCv?: CvDocument;
  statusEvents: ApplicationStatusEvent[];
}) {
  const createApplicationMutation = useCreateApplication();

  return (
    <OfferDetail
      offer={offer}
      latestTailoredCv={latestTailoredCv}
      masterCv={masterCv}
      onTrackApplication={(input, options) =>
        createApplicationMutation.mutate(input, options)
      }
      isTrackingApplication={createApplicationMutation.isPending}
      applicationTimeline={
        statusEvents.length > 0 ? (
          <ApplicationTimeline events={statusEvents} />
        ) : undefined
      }
    />
  );
}
