import 'server-only';

import type Stripe from 'stripe';

import { subscriptionService } from '@/entities/subscription/service';
import type { SubscriptionStatus } from '@/entities/subscription/types';
import { createAdminClient } from '@/shared/db/admin';

export class MissingOwnerIdError extends Error {
  constructor() {
    super('Stripe subscription is missing the owner_id metadata.');
    this.name = 'MissingOwnerIdError';
  }
}

// The webhook has no user session (no auth.uid() for RLS to match), so this
// is the one path in the app that writes with the service-role client — see
// ADR-015. owner_id travels on the Stripe subscription's own metadata,
// stamped there by create-checkout-session.service.ts's subscription_data.
export async function syncSubscriptionFromStripe(
  subscription: Stripe.Subscription,
  eventCreatedAt: number,
): Promise<void> {
  const admin = createAdminClient();
  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer.id;

  let ownerId = subscription.metadata.owner_id;
  if (!ownerId) {
    // Metadata is missing for subscriptions created outside our Checkout
    // flow (e.g. from the Stripe dashboard/portal). Fall back to the
    // customer id we already have on file instead of failing forever.
    const existingByCustomer =
      await subscriptionService.findByStripeCustomerId(customerId, admin);
    if (!existingByCustomer) throw new MissingOwnerIdError();
    ownerId = existingByCustomer.ownerId;
  }

  // Stripe doesn't guarantee webhook delivery order. Skip an event that's
  // older than the row we already have so a late `updated` can't undo a
  // newer `deleted` (or vice versa).
  // ponytail: compares wall-clock timestamps, no per-subscription event log;
  // revisit if Stripe events start arriving badly out of order in practice.
  const existing = await subscriptionService.findByOwnerId(ownerId, admin);
  if (existing && existing.updatedAt.getTime() > eventCreatedAt * 1000) return;

  const item = subscription.items.data[0];

  await subscriptionService.upsertFromStripe(
    {
      ownerId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      status: subscription.status as SubscriptionStatus,
      // Only one paid plan exists today; TASK-058 introduces the shared
      // plan list this will map the price id against once a second ships.
      plan: 'pro',
      currentPeriodEnd: item ? new Date(item.current_period_end * 1000) : null,
    },
    admin,
  );
}
