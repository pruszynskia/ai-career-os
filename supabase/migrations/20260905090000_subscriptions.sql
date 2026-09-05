-- Local projection of Stripe subscription state (TASK-056). Stripe is the
-- source of truth; the Stripe webhook is the only writer, using the
-- service-role client because a signature-verified webhook has no user
-- session and therefore no auth.uid() for RLS to match (see ADR-015). The
-- owner_all policy still applies so the owner can read their own row through
-- the normal request client.

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id),

  stripe_customer_id text not null,
  stripe_subscription_id text unique,
  status text not null,
  plan text not null,
  current_period_end timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index subscriptions_owner_id_idx on subscriptions (owner_id);
create index subscriptions_stripe_customer_id_idx on subscriptions (stripe_customer_id);

alter table subscriptions enable row level security;

create policy "owner_all" on subscriptions for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
