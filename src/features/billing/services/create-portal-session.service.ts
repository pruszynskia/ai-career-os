import 'server-only';

import { subscriptionService } from '@/entities/subscription/service';
import { siteOrigin } from '@/features/billing/services/create-checkout-session.service';
import { getStripeClient } from '@/shared/billing/stripe';

export class NoStripeCustomerError extends Error {
  constructor() {
    super('This account has no billing account to manage yet.');
    this.name = 'NoStripeCustomerError';
  }
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
