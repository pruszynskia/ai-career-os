import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  PostNotFoundError,
  markPostSent,
  schedulePost,
} from '@/features/linkedin-posts/services/schedule-post.service';

const scheduleBodySchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('schedule'),
    id: z.string(),
    scheduledAt: z.coerce.date(),
  }),
  z.object({
    action: z.literal('mark-sent'),
    id: z.string(),
  }),
]);

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => null);
  const parsedInput = scheduleBodySchema.safeParse(body);

  if (!parsedInput.success) {
    return NextResponse.json(
      { message: 'Provide a valid schedule or mark-sent action.' },
      { status: 400 },
    );
  }

  try {
    const post =
      parsedInput.data.action === 'schedule'
        ? await schedulePost(parsedInput.data.id, parsedInput.data.scheduledAt)
        : await markPostSent(parsedInput.data.id);

    return NextResponse.json({ post });
  } catch (error) {
    if (error instanceof PostNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }

    console.error('Failed to update the post', error);
    return NextResponse.json(
      { message: 'Failed to update the post.' },
      { status: 500 },
    );
  }
}
