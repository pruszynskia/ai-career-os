import 'server-only';

import { z } from 'zod';

import { postService } from '@/entities/post/service';
import { postCampaignService } from '@/entities/post-campaign/service';
import { profileService } from '@/entities/profile/service';
import {
  NoProfileError,
  buildProfileText,
} from '@/features/linkedin-posts/services/generate-post.service';
import {
  buildGenerateCampaignUserMessage,
  generateCampaignSystemPrompt,
} from '@/shared/ai/prompts/generate-campaign';
import { getAiService } from '@/shared/ai/service';
import { getOwnerId } from '@/shared/auth/session';

export { NoProfileError };

const generatedCampaignSchema = z.object({
  posts: z.array(
    z.object({ content: z.string(), scheduledAt: z.string().date() }),
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

  const { posts: generatedPosts } = await getAiService().generateStructured({
    messages: [
      { role: 'system', content: generateCampaignSystemPrompt },
      {
        role: 'user',
        content: buildGenerateCampaignUserMessage(
          buildProfileText(profile),
          theme,
          postCount,
          cadenceDays,
        ),
      },
    ],
    schema: generatedCampaignSchema,
    schemaName: 'generated_campaign',
  });

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
        }),
      ),
    );

    return { campaign, posts };
  } catch (error) {
    await postCampaignService.remove(campaign.id, ownerId);
    throw error;
  }
}
