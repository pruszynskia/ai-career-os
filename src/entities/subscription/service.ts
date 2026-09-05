import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';

import { createClient } from '@/shared/db/client';
import type {
  Subscription,
  SubscriptionStatus,
} from '@/entities/subscription/types';

function toSubscription(row: Record<string, unknown>): Subscription {
  return {
    id: row.id as string,
    ownerId: row.owner_id as string,
    stripeCustomerId: row.stripe_customer_id as string,
    stripeSubscriptionId:
      (row.stripe_subscription_id as string | null) ?? null,
    status: row.status as SubscriptionStatus,
    plan: row.plan as string,
    currentPeriodEnd: row.current_period_end
      ? new Date(row.current_period_end as string)
      : null,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  };
}

export const subscriptionService = {
  // `client` lets the Stripe webhook (no user session, hence no auth.uid()
  // for RLS to match — see ADR-015) pass in createAdminClient().
  async findByOwnerId(
    ownerId: string,
    client?: SupabaseClient,
  ): Promise<Subscription | null> {
    const supabase = client ?? (await createClient());
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('owner_id', ownerId)
      .maybeSingle();

    if (error) throw error;
    return data ? toSubscription(data) : null;
  },

  async findByStripeCustomerId(
    stripeCustomerId: string,
    client?: SupabaseClient,
  ): Promise<Subscription | null> {
    const supabase = client ?? (await createClient());
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('stripe_customer_id', stripeCustomerId)
      .maybeSingle();

    if (error) throw error;
    return data ? toSubscription(data) : null;
  },

  // The subscriptions RLS policy is select-only (see the migration): only
  // the webhook writes, using createAdminClient(). There is no request-client
  // fallback because the request client can never satisfy this write.
  async upsertFromStripe(
    values: {
      ownerId: string;
      stripeCustomerId: string;
      stripeSubscriptionId: string;
      status: SubscriptionStatus;
      plan: string;
      currentPeriodEnd: Date | null;
    },
    client: SupabaseClient,
  ): Promise<Subscription> {
    const supabase = client;
    const { data, error } = await supabase
      .from('subscriptions')
      .upsert(
        {
          owner_id: values.ownerId,
          stripe_customer_id: values.stripeCustomerId,
          stripe_subscription_id: values.stripeSubscriptionId,
          status: values.status,
          plan: values.plan,
          current_period_end: values.currentPeriodEnd
            ? values.currentPeriodEnd.toISOString()
            : null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'owner_id' },
      )
      .select()
      .single();

    if (error) throw error;
    return toSubscription(data);
  },
};
