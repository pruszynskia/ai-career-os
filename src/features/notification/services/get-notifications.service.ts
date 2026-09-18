import 'server-only';

import { applicationStatusEventService } from '@/entities/application-status-event/service';
import { applicationService } from '@/entities/application/service';
import { jobOfferService } from '@/entities/job-offer/service';
import { outreachMessageService } from '@/entities/outreach-message/service';
import { postService } from '@/entities/post/service';
import {
  deriveFollowUpNudge,
  derivePendingRequestNudge,
} from '@/features/notification/services/derive-nudges';
import type { Notification } from '@/features/notification/types';

const RECENT_MS = 24 * 60 * 60 * 1000;

function isRecent(date: Date): boolean {
  return Date.now() - date.getTime() < RECENT_MS;
}

export async function getNotifications(
  ownerId: string,
): Promise<Notification[]> {
  let scheduledPosts,
    sentPosts,
    draftPosts,
    applications,
    offers,
    statusEvents,
    outreachSends;
  try {
    [
      scheduledPosts,
      sentPosts,
      draftPosts,
      applications,
      offers,
      statusEvents,
      outreachSends,
    ] = await Promise.all([
      postService.findMany({ ownerId, status: 'SCHEDULED' }),
      postService.findMany({ ownerId, status: 'SENT' }, { orderBy: 'sentAt' }),
      postService.findMany(
        { ownerId, status: 'DRAFT' },
        { orderBy: 'createdAt' },
      ),
      applicationService.findMany({ ownerId }),
      jobOfferService.findMany({ ownerId }),
      applicationStatusEventService.findAllByOwnerId(ownerId),
      outreachMessageService.findSendsByOwnerId(ownerId),
    ]);
  } catch (error) {
    console.error('getNotifications: failed to aggregate notifications', error);
    return [];
  }

  const now = new Date();
  const notifications: Notification[] = [];

  for (const post of scheduledPosts) {
    if (post.scheduledAt && post.scheduledAt <= now) {
      notifications.push({
        id: `post-scheduled-${post.id}`,
        category: 'action-required',
        message: `Post scheduled for today: "${post.content.slice(0, 60)}"`,
        href: '/posts',
        occurredAt: post.scheduledAt,
      });
    }
  }

  for (const post of sentPosts) {
    if (post.sentAt && isRecent(post.sentAt)) {
      notifications.push({
        id: `post-sent-${post.id}`,
        category: 'action-required',
        message: 'Confirm you published this post on LinkedIn',
        href: '/posts',
        occurredAt: post.sentAt,
      });
    }
  }

  for (const post of draftPosts) {
    if (isRecent(post.createdAt)) {
      notifications.push({
        id: `post-draft-${post.id}`,
        category: 'general',
        message: `New draft post generated: "${post.content.slice(0, 60)}"`,
        href: '/posts',
        occurredAt: post.createdAt,
      });
    }
  }

  for (const application of applications) {
    if (application.isExpired) {
      notifications.push({
        id: `application-expired-${application.id}`,
        category: 'action-required',
        message: `Application to ${application.jobOffer.company} expired`,
        href: '/offers',
        occurredAt: application.updatedAt,
      });
    } else if (isRecent(application.createdAt)) {
      notifications.push({
        id: `application-created-${application.id}`,
        category: 'general',
        message: `Application to ${application.jobOffer.company} created`,
        href: '/offers',
        occurredAt: application.createdAt,
      });
    }
  }

  for (const offer of offers) {
    if (offer.isExpired && offer.expiresAt) {
      notifications.push({
        id: `offer-expired-${offer.id}`,
        category: 'action-required',
        message: `Offer at ${offer.company} expired`,
        href: `/offers/${offer.id}`,
        occurredAt: offer.expiresAt,
      });
    }
  }

  // Latest status event per application, and latest send per offer -
  // both nudges below key off whichever of these is most recent rather
  // than a stored "last notified" timestamp (TASK-086).
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
    if (nudge) notifications.push(nudge);
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
    if (nudge) notifications.push(nudge);
  }

  return notifications.sort(
    (a, b) => b.occurredAt.getTime() - a.occurredAt.getTime(),
  );
}
