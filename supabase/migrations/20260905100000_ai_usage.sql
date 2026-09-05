-- Per-owner AI-action usage log (TASK-059). One row per successful AI
-- action, written by the metered accessor in src/shared/ai/service.ts from
-- a request with a user session, so the request client (not the service
-- role) can write it under the usual owner_all policy.

create table ai_usage (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id),
  action text not null,
  created_at timestamptz not null default now()
);

create index ai_usage_owner_id_created_at_idx on ai_usage (owner_id, created_at);

alter table ai_usage enable row level security;

create policy "owner_all" on ai_usage for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
