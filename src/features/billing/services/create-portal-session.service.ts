import 'server-only';

import { headers } from 'next/headers';

import { subscriptionService } from '@/entities/subscription/service';
import { getStripeClient } from '@/shared/billing/stripe';

export class NoStripeCustomerError extends Error {
  constructor() {
    super('This account has no billing account to manage yet.');
    this.name = 'NoStripeCustomerError';
  }
}

// Mirrors the private siteOrigin() in create-checkout-session.service.ts —
// duplicated rather than imported since that one isn't exported either
// (see its own comment on why it doesn't import src/shared/auth/actions.ts).
async function siteOrigin(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  return host ? `http://${host}` : 'http://localhost:3000';
}

export async function createPortalSession(ownerId: string): Promise<string> {
  const subscription = await subscriptionService.findByOwnerId(ownerId);
  if (!subscription) throw new NoStripeCustomerError();

  const stripe = getStripeClient();
  const origin = await siteOrigin();
  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${origin}/settings`,
  });

  return session.url;
}
