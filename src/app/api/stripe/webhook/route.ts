import { NextResponse } from 'next/server';
import type Stripe from 'stripe';

import { syncSubscriptionFromStripe } from '@/features/billing/services/sync-subscription.service';
import { getStripeClient } from '@/shared/billing/stripe';

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { message: 'Missing Stripe signature.' },
      { status: 400 },
    );
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripeClient().webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret,
    );
  } catch (error) {
    console.error('Invalid Stripe webhook signature', error);
    return NextResponse.json({ message: 'Invalid signature.' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        if (typeof session.subscription === 'string') {
          const subscription = await getStripeClient().subscriptions.retrieve(
            session.subscription,
          );
          await syncSubscriptionFromStripe(subscription);
        }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        await syncSubscriptionFromStripe(event.data.object);
        break;
      }
      default:
        break;
    }
  } catch (error) {
    console.error('Failed to sync subscription from Stripe webhook', error);
    return NextResponse.json(
      { message: 'Failed to process webhook.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
