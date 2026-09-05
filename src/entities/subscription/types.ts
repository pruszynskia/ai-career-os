import { z } from 'zod';

// Mirrors Stripe.Subscription.Status.
export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'unpaid'
  | 'paused';

export const subscriptionStatusSchema = z.enum([
  'active',
  'trialing',
  'past_due',
  'canceled',
  'incomplete',
  'incomplete_expired',
  'unpaid',
  'paused',
]);

export const subscriptionSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  stripeCustomerId: z.string().min(1),
  stripeSubscriptionId: z.string().nullable(),
  status: subscriptionStatusSchema,
  plan: z.string().min(1),
  currentPeriodEnd: z.date().nullable(),
  lastStripeEventAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export interface Subscription {
  id: string;
  ownerId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string | null;
  status: SubscriptionStatus;
  plan: string;
  currentPeriodEnd: Date | null;
  lastStripeEventAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
