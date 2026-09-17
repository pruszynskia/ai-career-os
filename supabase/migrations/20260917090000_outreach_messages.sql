-- Outreach studio - channel formats, ban-list validator and variation check
-- (TASK-083). Replaces the single, unpersisted recruiter message with three
-- channel-specific drafts, each a row here so the 30-day variation check
-- (outreach-validator.ts) has something to compare a new draft against.

create type outreach_channel as enum ('CONNECTION_NOTE', 'DIRECT_MESSAGE', 'EMAIL');

create table outreach_messages (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id),

  job_offer_id uuid not null references job_offers (id),
  channel outreach_channel not null,

  subject text,
  body text not null,

  -- Contact this draft was addressed to, supplied per-generation (no
  -- "contacts" entity exists yet) rather than stored on job_offers - see
  -- ADR-020. Both null only ever happens for a row that was never written,
  -- since the no-contact path (recruiter-addressed channels) persists
  -- nothing at all.
  contact_name text,
  contact_url text,

  status text not null default 'DRAFT',

  created_at timestamptz not null default now()
);

create index outreach_messages_owner_id_idx on outreach_messages (owner_id);
create index outreach_messages_job_offer_id_idx on outreach_messages (job_offer_id);

alter table outreach_messages enable row level security;

create policy "owner_all" on outreach_messages for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
