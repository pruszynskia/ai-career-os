import 'server-only';

import { postService } from '@/entities/post/service';

export class PostNotFoundError extends Error {
  constructor() {
    super('Post not found.');
    this.name = 'PostNotFoundError';
  }
}

export async function getPostOrThrow(id: string, ownerId: string) {
  const existing = await postService.findFirst({ id, ownerId });

  if (!existing) throw new PostNotFoundError();

  return existing;
}
