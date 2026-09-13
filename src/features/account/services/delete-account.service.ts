import 'server-only';

import Stripe from 'stripe';

import { subscriptionService } from '@/entities/subscription/service';
import { getStripeClient } from '@/shared/billing/stripe';
import { createClient } from '@/shared/db/client';

// The statuses sync-subscription.service.ts's webhook writes for a
// subscription Stripe no longer considers cancellable.
const ALREADY_ENDED_STATUSES = new Set(['canceled', 'incomplete_expired']);

export class NotSignedInError extends Error {
  constructor() {
    super('deleteOwnAccount() called without an authenticated session.');
    this.name = 'NotSignedInError';
  }
}

// Deletes the signed-in owner's account: cancels any active Stripe
// subscription first, then removes every row that owner has — including
// their auth.users row — through the delete_own_account() RPC (see the
// migration), which keeps this on the ordinary request client and adds no
// second createAdminClient() caller (ADR-015). Never call this with a
// client-supplied id; the owner is always resolved from the request's own
// session.
export async function deleteOwnAccount(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new NotSignedInError();

  const subscription = await subscriptionService.findByOwnerId(user.id);
  if (
    subscription?.stripeSubscriptionId &&
    !ALREADY_ENDED_STATUSES.has(subscription.status)
  ) {
    const stripe = getStripeClient();
    try {
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
    } catch (caught) {
      // The local subscriptions projection can be stale (e.g. Stripe
      // already canceled it, or the id no longer exists) — that's not a
      // reason to block deletion, only an unexpected Stripe error is.
      const alreadyGone =
        caught instanceof Stripe.errors.StripeInvalidRequestError &&
        (caught.code === 'resource_missing' ||
          caught.message.includes('already been canceled'));
      if (!alreadyGone) throw caught;
    }
  }

  const { error } = await supabase.rpc('delete_own_account');
  if (error) throw error;

  await supabase.auth.signOut();
}
