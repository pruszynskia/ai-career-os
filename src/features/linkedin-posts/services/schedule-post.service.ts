import 'server-only';

import { postService } from '@/entities/post/service';
import {
  getPostOrThrow,
  PostNotFoundError,
} from '@/features/linkedin-posts/services/get-post';
import { getOwnerId } from '@/shared/auth/session';

export { PostNotFoundError };

export async function schedulePost(id: string, scheduledAt: Date) {
  const ownerId = await getOwnerId();
  await getPostOrThrow(id, ownerId);

  return postService.update(id, ownerId, {
    scheduledAt,
    status: 'SCHEDULED',
    sentAt: null,
  });
}

export async function markPostSent(id: string) {
  const ownerId = await getOwnerId();
  await getPostOrThrow(id, ownerId);

  return postService.update(id, ownerId, {
    sentAt: new Date(),
    status: 'SENT',
  });
}
