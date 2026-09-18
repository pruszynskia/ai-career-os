import 'server-only';

import { z } from 'zod';

import { postService } from '@/entities/post/service';
import { profileService } from '@/entities/profile/service';
import { NoProfileError } from '@/features/linkedin-posts/services/generate-post.service';
import {
  assertEvidenceBase,
  assertValidClaims,
} from '@/shared/ai/claim-validator';
import {
  buildPlanPostsUserMessage,
  planPostsSystemPrompt,
} from '@/shared/ai/prompts/plan-posts';
import { serializeEvidenceBase } from '@/shared/ai/prompts/generation-contract';
import { getMeteredAiService } from '@/shared/ai/service';
import { getOwnerId } from '@/shared/auth/session';

const plannedPostsSchema = z.object({
  posts: z.array(
    z.object({ content: z.string(), claimsUsed: z.array(z.string()) }),
  ),
});

export { NoProfileError };

export async function planPosts() {
  const ownerId = await getOwnerId();
  const profile = await profileService.findUnique(ownerId);

  if (!profile) throw new NoProfileError();
  assertEvidenceBase(profile.evidence);

  // Avoid claims already told (SENT) as well as claims already committed to
  // an upcoming post (SCHEDULED) - matches generate-campaign.service.ts,
  // since a still-scheduled post reserves its claim just as much as a sent
  // one does.
  const [sentPosts, scheduledPosts] = await Promise.all([
    postService.findMany(
      { ownerId, status: 'SENT' },
      { orderBy: 'sentAt', take: 10 },
    ),
    postService.findMany({ ownerId, status: 'SCHEDULED' }),
  ]);

  const sentPostsText =
    sentPosts.length > 0
      ? sentPosts.map((post) => post.content).join('\n\n')
      : 'No posts sent yet.';
  const usedClaimIds = Array.from(
    new Set(
      [...sentPosts, ...scheduledPosts].flatMap((post) => post.claimsUsed),
    ),
  );
  const usedClaimsText =
    usedClaimIds.length > 0 ? usedClaimIds.join(', ') : 'none';

  const aiService = await getMeteredAiService('plan_posts');
  const { posts: plannedPosts } = await aiService.generateStructured({
    messages: [
      { role: 'system', content: planPostsSystemPrompt },
      {
        role: 'user',
        content: buildPlanPostsUserMessage(
          serializeEvidenceBase(profile.evidence),
          sentPostsText,
          usedClaimsText,
        ),
      },
    ],
    schema: plannedPostsSchema,
    schemaName: 'planned_posts',
  });

  for (const plannedPost of plannedPosts) {
    assertValidClaims(profile.evidence, {
      claimsUsed: plannedPost.claimsUsed,
      text: plannedPost.content,
    });
  }

  const posts = await Promise.all(
    plannedPosts.map((plannedPost) =>
      postService.create({
        ownerId,
        content: plannedPost.content,
        status: 'DRAFT',
        claimsUsed: plannedPost.claimsUsed,
      }),
    ),
  );

  return { posts };
}
