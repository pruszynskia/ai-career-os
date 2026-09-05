import 'server-only';

import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

// Lazily constructed the same way getAiService() reads its provider key —
// constructing at import time would crash any module graph that imports
// this file before STRIPE_SECRET_KEY is set (e.g. tests, scripts).
export function getStripeClient(): Stripe {
  if (stripeClient) return stripeClient;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('Missing STRIPE_SECRET_KEY environment variable.');
  }

  stripeClient = new Stripe(secretKey);
  return stripeClient;
}
