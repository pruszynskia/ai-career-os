import 'server-only';

import type { PostStatus } from '@/entities/post/types';
import { postService } from '@/entities/post/service';
import {
  getPostOrThrow,
  PostNotFoundError,
} from '@/features/linkedin-posts/services/get-post';
import { getOwnerId } from '@/shared/auth/session';

export { PostNotFoundError };

export async function updatePost(
  id: string,
  values: { content?: string; status?: PostStatus },
) {
  const ownerId = await getOwnerId();
  const existing = await getPostOrThrow(id, ownerId);

  const patch: Parameters<typeof postService.update>[2] = { ...values };

  if (values.status !== undefined && values.status !== existing.status) {
    if (values.status !== 'SCHEDULED') patch.scheduledAt = null;
    if (values.status !== 'SENT') patch.sentAt = null;
  }

  return postService.update(id, ownerId, patch);
}
