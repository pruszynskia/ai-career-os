import 'server-only';

import { z } from 'zod';

import { postService } from '@/entities/post/service';
import { profileService } from '@/entities/profile/service';
import {
  NoProfileError,
  buildProfileText,
} from '@/features/linkedin-posts/services/generate-post.service';
import {
  buildPlanPostsUserMessage,
  planPostsSystemPrompt,
} from '@/shared/ai/prompts/plan-posts';
import { getAiService } from '@/shared/ai/service';
import { getOwnerId } from '@/shared/auth/session';

const plannedPostsSchema = z.object({
  posts: z.array(z.object({ content: z.string() })),
});

export { NoProfileError };

export async function planPosts() {
  const ownerId = await getOwnerId();
  const profile = await profileService.findUnique(ownerId);

  if (!profile) throw new NoProfileError();

  const sentPosts = await postService.findMany(
    { ownerId, status: 'SENT' },
    { orderBy: 'sentAt', take: 10 },
  );

  const sentPostsText =
    sentPosts.length > 0
      ? sentPosts.map((post) => post.content).join('\n\n')
      : 'No posts sent yet.';

  const { posts: plannedPosts } = await getAiService().generateStructured({
    messages: [
      { role: 'system', content: planPostsSystemPrompt },
      {
        role: 'user',
        content: buildPlanPostsUserMessage(
          buildProfileText(profile),
          sentPostsText,
        ),
      },
    ],
    schema: plannedPostsSchema,
    schemaName: 'planned_posts',
  });

  const posts = await Promise.all(
    plannedPosts.map((plannedPost) =>
      postService.create({
        ownerId,
        content: plannedPost.content,
        status: 'DRAFT',
      }),
    ),
  );

  return { posts };
}
