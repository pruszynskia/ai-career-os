// Pure derivation for the two follow-up nudges (TASK-086) - kept free of
// data-fetching/'server-only' so it's unit-testable, mirroring
// response-rate-readout.ts's split from its .service.ts wrapper.

import type { ApplicationBundle, ApplicationStatus } from '@/entities/application/types';
import { isTerminalApplicationStatus } from '@/entities/application/types';
import type { ApplicationStatusEvent } from '@/entities/application-status-event/types';
import type { JobOffer } from '@/entities/job-offer/types';
import type { OutreachChannel } from '@/entities/outreach-message/types';
import type { Notification } from '@/features/notification/types';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const FOLLOW_UP_AFTER_DAYS = 7;
const PENDING_REQUEST_AFTER_DAYS = 14;

function daysBetween(from: Date, to: Date): number {
  return (to.getTime() - from.getTime()) / MS_PER_DAY;
}

export interface FollowUpNudgeInput {
  applicationId: string;
  jobOfferId: string;
  company: string;
  status: ApplicationStatus;
  // Latest application_status_events entry for this application - the
  // trigger is derived from history, never a stored "last notified" field
  // (see the task's do_not).
  latestStatusEventAt: Date;
  // This offer's most recent outreach send, if any - whichever of the two
  // is more recent resets the follow-up window.
  latestOutreachAt: Date | null;
}

// An application with no movement for a week and no terminal outcome
// (TASK-085) gets a nudge to send a short follow-up.
export function deriveFollowUpNudge(
  input: FollowUpNudgeInput,
  now: Date,
): Notification | null {
  if (isTerminalApplicationStatus(input.status)) return null;

  const triggerAt =
    input.latestOutreachAt && input.latestOutreachAt > input.latestStatusEventAt
      ? input.latestOutreachAt
      : input.latestStatusEventAt;
  const daysSince = daysBetween(triggerAt, now);
  if (daysSince < FOLLOW_UP_AFTER_DAYS) return null;

  // Bucketed by week-since-trigger, not just applicationId: a dismiss only
  // suppresses this occurrence. Without the bucket, dismissing once
  // permanently hid every later nudge for the same application even as
  // silence kept dragging on - the exact "sits in the pipeline forever"
  // bug this feature exists to fix.
  const occurrence = Math.floor(daysSince / FOLLOW_UP_AFTER_DAYS);

  return {
    id: `followup-nudge-${input.applicationId}-${occurrence}`,
    category: 'action-required',
    message: `No word from ${input.company} in ${Math.floor(daysSince)} days - send a short follow-up`,
    href: `/offers/${input.jobOfferId}?followUp=1`,
    occurredAt: triggerAt,
    dismissible: true,
  };
}

export interface PendingRequestNudgeInput {
  outreachMessageId: string;
  jobOfferId: string;
  company: string;
  sentAt: Date;
}

// A connection note sent and never accepted after two weeks is what grows
// the pending-request queue that trips LinkedIn's own restrictions -
// nudge to withdraw it rather than let it sit.
export function derivePendingRequestNudge(
  input: PendingRequestNudgeInput,
  now: Date,
): Notification | null {
  const daysSince = daysBetween(input.sentAt, now);
  if (daysSince < PENDING_REQUEST_AFTER_DAYS) return null;

  // Same week-bucketing as the follow-up nudge above, for the same reason.
  const occurrence = Math.floor(daysSince / PENDING_REQUEST_AFTER_DAYS);

  return {
    id: `pending-request-nudge-${input.outreachMessageId}-${occurrence}`,
    category: 'action-required',
    message: `Connection request to ${input.company} still pending after ${Math.floor(daysSince)} days - consider withdrawing it`,
    href: `/offers/${input.jobOfferId}`,
    occurredAt: input.sentAt,
    dismissible: true,
  };
}

export interface OutreachSend {
  id: string;
  jobOfferId: string;
  channel: OutreachChannel;
  status: 'DRAFT' | 'SENT';
  createdAt: Date;
}

// Shared aggregation over raw entities into the two nudge lists above -
// get-notifications.service.ts (popover) and the dashboard's Needs
// attention both call this so they always agree on the same nudge for the
// same fixture, instead of each re-deriving the latest-event/latest-send
// maps themselves.
export function deriveNudges(
  input: {
    applications: ApplicationBundle[];
    offers: JobOffer[];
    statusEvents: ApplicationStatusEvent[];
    outreachSends: OutreachSend[];
  },
  now: Date,
): Notification[] {
  const { applications, offers, statusEvents, outreachSends } = input;
  const nudges: Notification[] = [];

  const latestEventByApplication = new Map<string, Date>();
  for (const event of statusEvents) {
    const current = latestEventByApplication.get(event.applicationId);
    if (!current || event.createdAt > current) {
      latestEventByApplication.set(event.applicationId, event.createdAt);
    }
  }
  const latestSendByOffer = new Map<string, Date>();
  for (const send of outreachSends) {
    if (send.status !== 'SENT') continue;
    const current = latestSendByOffer.get(send.jobOfferId);
    if (!current || send.createdAt > current) {
      latestSendByOffer.set(send.jobOfferId, send.createdAt);
    }
  }

  for (const application of applications) {
    const latestStatusEventAt =
      latestEventByApplication.get(application.id) ?? application.createdAt;
    const nudge = deriveFollowUpNudge(
      {
        applicationId: application.id,
        jobOfferId: application.jobOfferId,
        company: application.jobOffer.company,
        status: application.status,
        latestStatusEventAt,
        latestOutreachAt: latestSendByOffer.get(application.jobOfferId) ?? null,
      },
      now,
    );
    if (nudge) nudges.push(nudge);
  }

  const offerById = new Map(offers.map((offer) => [offer.id, offer]));
  const applicationByOffer = new Map(
    applications.map((application) => [application.jobOfferId, application]),
  );
  for (const send of outreachSends) {
    if (send.channel !== 'CONNECTION_NOTE' || send.status !== 'SENT') continue;
    const offer = offerById.get(send.jobOfferId);
    if (!offer) continue;
    // "Still pending after 14 days" only holds while the application has
    // had no reply at all - HR/TECHNICAL/TEAM/CEO_OR_MANAGER already got
    // one even though those stages aren't terminal, same as any outcome.
    const application = applicationByOffer.get(send.jobOfferId);
    if (application && application.status !== 'APPLIED') continue;

    const nudge = derivePendingRequestNudge(
      {
        outreachMessageId: send.id,
        jobOfferId: send.jobOfferId,
        company: offer.company,
        sentAt: send.createdAt,
      },
      now,
    );
    if (nudge) nudges.push(nudge);
  }

  return nudges;
}
