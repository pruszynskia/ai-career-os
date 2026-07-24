import 'server-only';

import { postService } from '@/entities/post/service';
import { getOwnerId } from '@/shared/auth/session';

export class PostNotFoundError extends Error {
  constructor() {
    super('Post not found.');
    this.name = 'PostNotFoundError';
  }
}

async function getPostOrThrow(id: string, ownerId: string) {
  const existing = await postService.findFirst({ id, ownerId });

  if (!existing) throw new PostNotFoundError();
}

export async function schedulePost(id: string, scheduledAt: Date) {
  const ownerId = await getOwnerId();
  await getPostOrThrow(id, ownerId);

  return postService.update(id, {
    scheduledAt,
    status: 'SCHEDULED',
    sentAt: null,
  });
}

export async function markPostSent(id: string) {
  const ownerId = await getOwnerId();
  await getPostOrThrow(id, ownerId);

  return postService.update(id, { sentAt: new Date(), status: 'SENT' });
}
