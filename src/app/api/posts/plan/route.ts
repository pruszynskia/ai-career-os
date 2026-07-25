import { NextResponse } from 'next/server';

import {
  NoProfileError,
  planPosts,
} from '@/features/linkedin-posts/services/plan-posts.service';
import { toAiErrorResponse } from '@/shared/ai/errors';

export async function POST() {
  try {
    const { posts } = await planPosts();
    return NextResponse.json({ posts });
  } catch (error) {
    if (error instanceof NoProfileError) {
      return NextResponse.json({ message: error.message }, { status: 422 });
    }

    return toAiErrorResponse(error, 'Failed to plan the next posts.');
  }
}
