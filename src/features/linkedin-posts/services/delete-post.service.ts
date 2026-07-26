import 'server-only';

import { postService } from '@/entities/post/service';
import {
  getPostOrThrow,
  PostNotFoundError,
} from '@/features/linkedin-posts/services/get-post';
import { getOwnerId } from '@/shared/auth/session';

export { PostNotFoundError };

export async function deletePost(id: string) {
  const ownerId = await getOwnerId();
  await getPostOrThrow(id, ownerId);

  await postService.remove(id, ownerId);
}
