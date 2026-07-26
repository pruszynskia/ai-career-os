-- Post campaigns: a themed group of AI-generated posts with suggested
-- publication dates, generated in one AI call (TASK-029).

create table post_campaigns (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id),

  theme text not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index post_campaigns_owner_id_idx on post_campaigns (owner_id);

alter table posts add column campaign_id uuid references post_campaigns (id);

create index posts_campaign_id_idx on posts (campaign_id);

alter table post_campaigns enable row level security;

create policy "owner_all" on post_campaigns for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
