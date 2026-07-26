import { NextResponse } from 'next/server';
import { z } from 'zod';

import { postCampaignService } from '@/entities/post-campaign/service';
import {
  NoProfileError,
  generateCampaign,
} from '@/features/linkedin-posts/services/generate-campaign.service';
import { toAiErrorResponse } from '@/shared/ai/errors';
import { getOwnerId } from '@/shared/auth/session';

const generateCampaignSchema = z.object({
  theme: z.string().min(1),
  postCount: z.number().int().min(1).max(10),
  cadenceDays: z.number().int().min(1).max(30),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsedInput = generateCampaignSchema.safeParse(body);

  if (!parsedInput.success) {
    return NextResponse.json(
      {
        message: 'Provide a theme, post count and cadence for the campaign.',
      },
      { status: 400 },
    );
  }

  try {
    const { campaign, posts } = await generateCampaign(
      parsedInput.data.theme,
      parsedInput.data.postCount,
      parsedInput.data.cadenceDays,
    );
    return NextResponse.json({ campaign, posts });
  } catch (error) {
    if (error instanceof NoProfileError) {
      return NextResponse.json({ message: error.message }, { status: 422 });
    }

    return toAiErrorResponse(error, 'Failed to generate the campaign.');
  }
}

export async function GET() {
  const ownerId = await getOwnerId();
  const campaigns = await postCampaignService.findMany({ ownerId });
  return NextResponse.json({ campaigns });
}
