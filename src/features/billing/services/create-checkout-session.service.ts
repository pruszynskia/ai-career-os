import 'server-only';

import { headers } from 'next/headers';

import { subscriptionService } from '@/entities/subscription/service';
import { getStripeClient } from '@/shared/billing/stripe';
import { createClient } from '@/shared/db/client';

// Only one paid plan exists today (docs/PRODUCT.md); TASK-058 introduces the
// shared plan list this will read from once a second paid tier ships.
export type CheckoutPlan = 'pro';

export class MissingPriceIdError extends Error {
  constructor(plan: string) {
    super(`No Stripe price configured for plan "${plan}".`);
    this.name = 'MissingPriceIdError';
  }
}

// Mirrors the private siteOrigin() in src/shared/auth/actions.ts — that
// helper isn't exported and this task's scope doesn't touch src/shared/auth/**.
async function siteOrigin(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  return host ? `http://${host}` : 'http://localhost:3000';
}

const PRICE_ID_BY_PLAN: Record<CheckoutPlan, string | undefined> = {
  pro: process.env.STRIPE_PRICE_ID_PRO,
};

export async function createCheckoutSession(
  ownerId: string,
  plan: CheckoutPlan,
): Promise<string> {
  const priceId = PRICE_ID_BY_PLAN[plan];
  if (!priceId) throw new MissingPriceIdError(plan);

  const stripe = getStripeClient();
  const existingSubscription = await subscriptionService.findByOwnerId(ownerId);

  let customerId = existingSubscription?.stripeCustomerId;
  if (!customerId) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const customer = await stripe.customers.create({
      email: user?.email,
      metadata: { owner_id: ownerId },
    });
    customerId = customer.id;
  }

  const origin = await siteOrigin();
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/dashboard?checkout=success`,
    cancel_url: `${origin}/pricing?checkout=cancelled`,
    client_reference_id: ownerId,
    subscription_data: { metadata: { owner_id: ownerId } },
  });

  if (!session.url) {
    throw new Error('Stripe did not return a Checkout session URL.');
  }

  return session.url;
}
