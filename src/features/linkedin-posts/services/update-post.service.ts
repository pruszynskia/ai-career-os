import 'server-only';

import type { PostStatus } from '@/entities/post/types';
import { postService } from '@/entities/post/service';
import {
  getPostOrThrow,
  PostNotFoundError,
} from '@/features/linkedin-posts/services/get-post';
import { getOwnerId } from '@/shared/auth/session';

export { PostNotFoundError };

// Thrown when this route is asked to move a post to SCHEDULED (POST-1) - it
// has no way to take the required date, unlike the dedicated schedule
// action (src/features/linkedin-posts/services/schedule-post.service.ts).
export class InvalidStatusTransitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidStatusTransitionError';
  }
}

export async function updatePost(
  id: string,
  values: { content?: string; status?: PostStatus },
) {
  const ownerId = await getOwnerId();
  const existing = await getPostOrThrow(id, ownerId);

  const patch: Parameters<typeof postService.update>[2] = { ...values };

  if (values.status !== undefined && values.status !== existing.status) {
    if (values.status === 'SCHEDULED') {
      throw new InvalidStatusTransitionError(
        'Use the schedule action to set a post to Scheduled with a date.',
      );
    }
    patch.scheduledAt = null;
    patch.sentAt = values.status === 'SENT' ? new Date() : null;
  }

  return postService.update(id, ownerId, patch);
}
