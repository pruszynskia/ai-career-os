import 'server-only';

import { z } from 'zod';

import { postService } from '@/entities/post/service';
import { postCampaignService } from '@/entities/post-campaign/service';
import { profileService } from '@/entities/profile/service';
import { NoProfileError } from '@/features/linkedin-posts/services/generate-post.service';
import {
  assertEvidenceBase,
  assertValidClaims,
} from '@/shared/ai/claim-validator';
import {
  buildGenerateCampaignUserMessage,
  generateCampaignSystemPrompt,
} from '@/shared/ai/prompts/generate-campaign';
import { serializeEvidenceBase } from '@/shared/ai/prompts/generation-contract';
import { getMeteredAiService } from '@/shared/ai/service';
import { getOwnerId } from '@/shared/auth/session';

export { NoProfileError };

const generatedCampaignSchema = z.object({
  posts: z.array(
    z.object({
      content: z.string(),
      scheduledAt: z.string().date(),
      claimsUsed: z.array(z.string()),
    }),
  ),
});

export async function generateCampaign(
  theme: string,
  postCount: number,
  cadenceDays: number,
) {
  const ownerId = await getOwnerId();
  const profile = await profileService.findUnique(ownerId);

  if (!profile) throw new NoProfileError();
  assertEvidenceBase(profile.evidence);

  // Avoid claims already told (SENT) as well as claims already committed to
  // an upcoming post (SCHEDULED) - a still-scheduled campaign post reserves
  // its claim just as much as a sent one does.
  const [recentSentPosts, scheduledPosts] = await Promise.all([
    postService.findMany(
      { ownerId, status: 'SENT' },
      { orderBy: 'sentAt', take: 10 },
    ),
    postService.findMany({ ownerId, status: 'SCHEDULED' }),
  ]);
  const usedClaimIds = Array.from(
    new Set(
      [...recentSentPosts, ...scheduledPosts].flatMap(
        (post) => post.claimsUsed,
      ),
    ),
  );
  const usedClaimsText =
    usedClaimIds.length > 0 ? usedClaimIds.join(', ') : 'none';

  const aiService = await getMeteredAiService('generate_campaign');
  const { posts: generatedPosts } = await aiService.generateStructured({
    messages: [
      { role: 'system', content: generateCampaignSystemPrompt },
      {
        role: 'user',
        content: buildGenerateCampaignUserMessage(
          serializeEvidenceBase(profile.evidence),
          theme,
          postCount,
          cadenceDays,
          usedClaimsText,
        ),
      },
    ],
    schema: generatedCampaignSchema,
    schemaName: 'generated_campaign',
  });

  for (const generatedPost of generatedPosts) {
    assertValidClaims(profile.evidence, {
      claimsUsed: generatedPost.claimsUsed,
      text: generatedPost.content,
    });
  }

  const campaign = await postCampaignService.create({ ownerId, theme });

  try {
    const posts = await Promise.all(
      generatedPosts.map((generatedPost) =>
        postService.create({
          ownerId,
          content: generatedPost.content,
          status: 'SCHEDULED',
          scheduledAt: new Date(generatedPost.scheduledAt),
          campaignId: campaign.id,
          claimsUsed: generatedPost.claimsUsed,
        }),
      ),
    );

    return { campaign, posts };
  } catch (error) {
    await postCampaignService.remove(campaign.id, ownerId);
    throw error;
  }
}
