import { NextResponse } from 'next/server';

import {
  NoProfileError,
  planPosts,
} from '@/features/linkedin-posts/services/plan-posts.service';
import { isRateLimitError } from '@/shared/ai/service';

export async function POST() {
  try {
    const { posts } = await planPosts();
    return NextResponse.json({ posts });
  } catch (error) {
    if (error instanceof NoProfileError) {
      return NextResponse.json({ message: error.message }, { status: 422 });
    }

    if (isRateLimitError(error)) {
      return NextResponse.json(
        {
          message:
            'The AI provider rate limit or quota was exceeded. Try again later.',
        },
        { status: 429 },
      );
    }

    console.error('Failed to plan the next posts', error);
    return NextResponse.json(
      { message: 'Failed to plan the next posts.' },
      { status: 500 },
    );
  }
}
