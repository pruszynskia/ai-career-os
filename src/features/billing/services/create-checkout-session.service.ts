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

export class AlreadySubscribedError extends Error {
  constructor() {
    super('This account already has an active subscription.');
    this.name = 'AlreadySubscribedError';
  }
}

// Mirrors the private siteOrigin() in src/shared/auth/actions.ts — that
// helper isn't exported and this task's scope doesn't touch src/shared/auth/**.
export async function siteOrigin(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  if (!host) return 'http://localhost:3000';
  return `${host.startsWith('localhost') ? 'http' : 'https'}://${host}`;
}

const PRICE_ID_BY_PLAN: Record<CheckoutPlan, string | undefined> = {
  pro: process.env.STRIPE_PRICE_ID_PRO,
};

// Stripe states that mean a subscription exists (or is mid-payment) and a
// second Checkout would double-charge.
const BLOCKING_STRIPE_STATUSES = new Set(['active', 'trialing', 'incomplete']);

export async function createCheckoutSession(
  ownerId: string,
  plan: CheckoutPlan,
): Promise<string> {
  const priceId = PRICE_ID_BY_PLAN[plan];
  if (!priceId) throw new MissingPriceIdError(plan);

  const stripe = getStripeClient();
  const existingSubscription = await subscriptionService.findByOwnerId(ownerId);

  if (
    existingSubscription &&
    ['active', 'trialing'].includes(existingSubscription.status)
  ) {
    throw new AlreadySubscribedError();
  }

  let customerId = existingSubscription?.stripeCustomerId;
  if (!customerId) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // An abandoned checkout never reaches a webhook that would save the
    // customer id, so check Stripe for one we already created before
    // minting another for the same owner. Filter by our own owner_id
    // metadata (not just email) so a Stripe customer that happens to share
    // this email for an unrelated reason is never reused.
    const existingByEmail = user?.email
      ? await stripe.customers.list({ email: user.email, limit: 10 })
      : null;
    const ownedByThisUser = existingByEmail?.data.find(
      (customer) => customer.metadata.owner_id === ownerId,
    );

    customerId =
      ownedByThisUser?.id ??
      (
        await stripe.customers.create({
          email: user?.email,
          metadata: { owner_id: ownerId },
        })
      ).id;
  }

  // Our row is written by the webhook, which can lag the Checkout redirect by
  // seconds - long enough for a second "Upgrade" click. Ask Stripe directly.
  const stripeSubscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'all',
    limit: 10,
  });
  if (
    stripeSubscriptions.data.some((sub) =>
      BLOCKING_STRIPE_STATUSES.has(sub.status),
    )
  ) {
    throw new AlreadySubscribedError();
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
