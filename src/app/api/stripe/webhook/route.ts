import { NextResponse } from 'next/server';
import type Stripe from 'stripe';

import {
  MissingOwnerIdError,
  syncSubscriptionFromStripe,
} from '@/features/billing/services/sync-subscription.service';
import { getStripeClient } from '@/shared/billing/stripe';

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    // Stripe doesn't retry 4xx responses, so a misconfigured deploy must
    // fail loud (500, retried) rather than silently discard every event.
    console.error('STRIPE_WEBHOOK_SECRET is not configured');
    return NextResponse.json(
      { message: 'Webhook is not configured.' },
      { status: 500 },
    );
  }

  if (!signature) {
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
          await syncSubscriptionFromStripe(subscription, event.created);
        }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        await syncSubscriptionFromStripe(event.data.object, event.created);
        break;
      }
      default:
        break;
    }
  } catch (error) {
    if (error instanceof MissingOwnerIdError) {
      // Can never be mapped to an owner (e.g. a subscription created outside
      // our Checkout flow with no matching customer on file). Retrying won't
      // help, so ack it rather than have Stripe retry for days.
      console.error('Stripe webhook event has no owner_id', error);
      return NextResponse.json({ received: true });
    }

    console.error('Failed to sync subscription from Stripe webhook', error);
    return NextResponse.json(
      { message: 'Failed to process webhook.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
