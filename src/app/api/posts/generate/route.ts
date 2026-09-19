import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  NoProfileError,
  generatePost,
} from '@/features/linkedin-posts/services/generate-post.service';
import {
  ClaimValidationError,
  NoEvidenceBaseError,
} from '@/shared/ai/claim-validator';
import { toAiErrorResponse } from '@/shared/ai/errors';

const generatePostSchema = z.object({
  topic: z.string().min(1),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsedInput = generatePostSchema.safeParse(body);

  if (!parsedInput.success) {
    return NextResponse.json(
      { message: 'Provide a topic for the post.' },
      { status: 400 },
    );
  }

  try {
    const { post } = await generatePost(parsedInput.data.topic);
    return NextResponse.json({ post });
  } catch (error) {
    if (
      error instanceof NoProfileError ||
      error instanceof NoEvidenceBaseError
    ) {
      return NextResponse.json({ message: error.message }, { status: 422 });
    }

    if (error instanceof ClaimValidationError) {
      return NextResponse.json(
        { message: error.message, violations: error.violations },
        { status: 422 },
      );
    }

    return toAiErrorResponse(error, 'Failed to generate the post.');
  }
}
