import 'server-only';

import { applicationService } from '@/entities/application/service';
import { jobOfferService } from '@/entities/job-offer/service';
import { postService } from '@/entities/post/service';
import type { Notification } from '@/features/notification/types';

const RECENT_MS = 24 * 60 * 60 * 1000;

function isRecent(date: Date): boolean {
  return Date.now() - date.getTime() < RECENT_MS;
}

export async function getNotifications(
  ownerId: string,
): Promise<Notification[]> {
  let scheduledPosts, sentPosts, draftPosts, applications, offers;
  try {
    [scheduledPosts, sentPosts, draftPosts, applications, offers] =
      await Promise.all([
        postService.findMany({ ownerId, status: 'SCHEDULED' }),
        postService.findMany(
          { ownerId, status: 'SENT' },
          { orderBy: 'sentAt' },
        ),
        postService.findMany(
          { ownerId, status: 'DRAFT' },
          { orderBy: 'createdAt' },
        ),
        applicationService.findMany({ ownerId }),
        jobOfferService.findMany({ ownerId }),
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
        href: '/applications',
        occurredAt: application.updatedAt,
      });
    } else if (isRecent(application.createdAt)) {
      notifications.push({
        id: `application-created-${application.id}`,
        category: 'general',
        message: `Application to ${application.jobOffer.company} created`,
        href: '/applications',
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

  return notifications.sort(
    (a, b) => b.occurredAt.getTime() - a.occurredAt.getTime(),
  );
}
