import { NextResponse } from 'next/server';

import {
  NoProfileError,
  planPosts,
} from '@/features/linkedin-posts/services/plan-posts.service';
import {
  ClaimValidationError,
  NoEvidenceBaseError,
} from '@/shared/ai/claim-validator';
import { toAiErrorResponse } from '@/shared/ai/errors';

export async function POST() {
  try {
    const { posts } = await planPosts();
    return NextResponse.json({ posts });
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

    return toAiErrorResponse(error, 'Failed to plan the next posts.');
  }
}
