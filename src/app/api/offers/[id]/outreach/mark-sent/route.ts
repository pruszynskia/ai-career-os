import { NextResponse } from 'next/server';
import { z } from 'zod';

import { outreachMessageService } from '@/entities/outreach-message/service';
import { getOwnerId } from '@/shared/auth/session';

const bodySchema = z.object({ messageId: z.string().min(1) });

// Nested under this offer's outreach route for consistency, but mark-sent
// only ever needs the message id + owner - the offer id in the path isn't
// used beyond routing.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsedInput = bodySchema.safeParse(body);

  if (!parsedInput.success) {
    return NextResponse.json(
      { message: 'messageId is required.' },
      { status: 400 },
    );
  }

  const ownerId = await getOwnerId();

  try {
    const message = await outreachMessageService.markSent(
      parsedInput.data.messageId,
      ownerId,
    );
    if (!message) {
      return NextResponse.json(
        { message: 'Outreach message not found.' },
        { status: 404 },
      );
    }
    return NextResponse.json({ message });
  } catch (error) {
    console.error('Failed to mark the outreach message as sent', error);
    return NextResponse.json(
      { message: 'Failed to mark the message as sent.' },
      { status: 500 },
    );
  }
}
