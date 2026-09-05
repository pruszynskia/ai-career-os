import { NextResponse } from 'next/server';

import {
  createPortalSession,
  NoStripeCustomerError,
} from '@/features/billing/services/create-portal-session.service';
import { getOwnerId } from '@/shared/auth/session';

export async function POST() {
  try {
    const ownerId = await getOwnerId();
    const url = await createPortalSession(ownerId);
    return NextResponse.json({ url });
  } catch (error) {
    if (error instanceof NoStripeCustomerError) {
      return NextResponse.json({ message: error.message }, { status: 422 });
    }

    console.error('Failed to create the billing portal session', error);
    return NextResponse.json(
      { message: 'Failed to create the billing portal session.' },
      { status: 500 },
    );
  }
}
