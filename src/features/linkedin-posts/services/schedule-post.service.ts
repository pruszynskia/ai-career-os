import 'server-only';

import { postService } from '@/entities/post/service';
import { SEED_OWNER_ID } from '@/shared/auth/owner';

export class PostNotFoundError extends Error {
  constructor() {
    super('Post not found.');
    this.name = 'PostNotFoundError';
  }
}

async function getPostOrThrow(id: string) {
  const existing = await postService.findFirst({
    where: { id, ownerId: SEED_OWNER_ID },
  });

  if (!existing) throw new PostNotFoundError();
}

export async function schedulePost(id: string, scheduledAt: Date) {
  await getPostOrThrow(id);

  return postService.update({
    where: { id },
    data: { scheduledAt, status: 'SCHEDULED', sentAt: null },
  });
}

export async function markPostSent(id: string) {
  await getPostOrThrow(id);

  return postService.update({
    where: { id },
    data: { sentAt: new Date(), status: 'SENT' },
  });
}
