-- Append-only history of application status transitions (TASK-050).
-- Immutable event rows: no updated_at, never updated in place and only
-- removed via the applications cascade. applications.status stays the
-- current-status column; this table is additive history, not a replacement.

create table application_status_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id),
  application_id uuid not null references applications (id) on delete cascade,
  status application_status not null,
  created_at timestamptz not null default now()
);

create index application_status_events_application_id_idx on application_status_events (application_id);
create index application_status_events_owner_id_idx on application_status_events (owner_id);

alter table application_status_events enable row level security;

create policy "owner_all" on application_status_events for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Backfill existing applications (mirrors the cv_document_kind backfill).
-- Seed the APPLIED event every application started at, plus its current
-- status where it has since moved (applications.updated_at is only ever
-- touched by the status update). Intermediate transitions predate this
-- table and are not reconstructable.
insert into application_status_events (owner_id, application_id, status, created_at)
select owner_id, id, 'APPLIED', created_at from applications;

insert into application_status_events (owner_id, application_id, status, created_at)
select owner_id, id, status, updated_at from applications where status <> 'APPLIED';
