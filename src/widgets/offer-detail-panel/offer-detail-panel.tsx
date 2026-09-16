'use client';

import type { Application } from '@/entities/application/types';
import type { ApplicationStatusEvent } from '@/entities/application-status-event/types';
import type { CvDocument } from '@/entities/cv-document/types';
import type { JobOffer } from '@/entities/job-offer/types';
import type { EvidenceBase } from '@/entities/profile/types';

import { ApplicationNotes } from '@/features/application/components/application-notes';
import { ApplicationTimeline } from '@/features/application/components/application-timeline';
import { useCreateApplication } from '@/features/application/hooks/use-create-application';
import { OfferDetail } from '@/features/job-offer/components/offer-detail';
import { useAddEvidenceSkill } from '@/features/profile/hooks/use-add-evidence-skill';

export function OfferDetailPanel({
  offer,
  latestTailoredCv,
  masterCv,
  statusEvents,
  application,
  evidence,
}: {
  offer: JobOffer;
  latestTailoredCv?: CvDocument;
  masterCv?: CvDocument;
  statusEvents: ApplicationStatusEvent[];
  application: Application | null;
  evidence: Pick<EvidenceBase, 'neverInclude' | 'alwaysIncludeWhenRelevant'>;
}) {
  const createApplicationMutation = useCreateApplication();
  const addEvidenceSkillMutation = useAddEvidenceSkill();

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
      applicationNotes={
        application ? (
          <ApplicationNotes
            key={application.id}
            applicationId={application.id}
            initialNotes={application.notes}
          />
        ) : undefined
      }
      alwaysIncludeWhenRelevant={evidence.alwaysIncludeWhenRelevant}
      onAddSkill={(skill) =>
        addEvidenceSkillMutation.mutate({ skill, evidence })
      }
      addingSkill={
        addEvidenceSkillMutation.isPending
          ? (addEvidenceSkillMutation.variables?.skill ?? null)
          : null
      }
    />
  );
}
