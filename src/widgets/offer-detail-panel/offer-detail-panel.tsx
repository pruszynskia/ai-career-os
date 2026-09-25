'use client';

import Link from 'next/link';

import type { ApplicationBundle } from '@/entities/application/types';
import type { ApplicationStatusEvent } from '@/entities/application-status-event/types';
import type { Contact } from '@/entities/contact/types';
import type { CvDocument } from '@/entities/cv-document/types';
import type { JobOffer } from '@/entities/job-offer/types';
import type { EvidenceBase } from '@/entities/profile/types';

import { ApplicationNotes } from '@/features/application/components/application-notes';
import { ApplicationStatusSelect } from '@/features/application/components/application-status-select';
import { ApplicationTimeline } from '@/features/application/components/application-timeline';
import { useCreateApplication } from '@/features/application/hooks/use-create-application';
import { WhoYouKnowPanel } from '@/features/contact/components/who-you-know-panel';
import { TailoringReport } from '@/features/document/components/tailoring-report';
import { OfferDetail } from '@/features/job-offer/components/offer-detail';
import { useAddEvidenceSkill } from '@/features/profile/hooks/use-add-evidence-skill';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';

export function OfferDetailPanel({
  offer,
  latestTailoredCv,
  masterCv,
  statusEvents,
  application,
  evidence,
  contacts,
  interlockWarning,
  canViewFitDetail,
  canViewTailoringReport,
}: {
  offer: JobOffer;
  latestTailoredCv?: CvDocument;
  masterCv?: CvDocument;
  statusEvents: ApplicationStatusEvent[];
  application: ApplicationBundle | null;
  evidence: Pick<EvidenceBase, 'neverInclude' | 'alwaysIncludeWhenRelevant'>;
  contacts: Contact[];
  interlockWarning: { contactName: string; messagedAt: Date } | null;
  // Pro-only reads (TASK-088) - the offer detail page resolves these
  // server-side so the widget only ever renders, never gates. offer.fit and
  // latestTailoredCv.tailoringReport are already stripped/never-built
  // server-side when the flag below is false.
  canViewFitDetail: boolean;
  canViewTailoringReport: boolean;
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
      application={application}
      applicationStatus={
        application ? (
          <ApplicationStatusSelect
            applicationId={application.id}
            status={application.status}
          />
        ) : undefined
      }
      applicationTimeline={
        statusEvents.length > 0 ? (
          <ApplicationTimeline events={statusEvents} />
        ) : undefined
      }
      applicationStatusEventCount={statusEvents.length}
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
      canViewFitDetail={canViewFitDetail}
      renderTailoringReport={(report) =>
        report ? (
          <TailoringReport report={report} />
        ) : canViewTailoringReport ? // Pro with no report yet (fit unscored): nothing to gate, stay silent.
        null : (
          <EmptyState
            message="See the tailoring report - keyword coverage and evidence trace - on Pro."
            action={
              <Button asChild size="sm">
                <Link href="/pricing">Upgrade to Pro</Link>
              </Button>
            }
          />
        )
      }
      renderWhoYouKnow={({ onSelect, selectedContactName }) => (
        <WhoYouKnowPanel
          company={offer.company}
          contacts={contacts}
          selectedContactName={selectedContactName}
          onSelect={onSelect}
        />
      )}
      interlockWarning={interlockWarning}
    />
  );
}
