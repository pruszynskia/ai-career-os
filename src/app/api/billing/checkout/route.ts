import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  AlreadySubscribedError,
  createCheckoutSession,
  MissingPriceIdError,
} from '@/features/billing/services/create-checkout-session.service';
import { getOwnerId } from '@/shared/auth/session';

const checkoutSchema = z.object({ plan: z.literal('pro') });

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsedInput = checkoutSchema.safeParse(body);

  if (!parsedInput.success) {
    return NextResponse.json(
      { message: 'A valid plan is required.' },
      { status: 400 },
    );
  }

  try {
    const ownerId = await getOwnerId();
    const url = await createCheckoutSession(ownerId, parsedInput.data.plan);
    return NextResponse.json({ url });
  } catch (error) {
    if (error instanceof MissingPriceIdError) {
      return NextResponse.json({ message: error.message }, { status: 422 });
    }
    if (error instanceof AlreadySubscribedError) {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }

    console.error('Failed to create the Checkout session', error);
    return NextResponse.json(
      { message: 'Failed to create the Checkout session.' },
      { status: 500 },
    );
  }
}
