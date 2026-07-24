-- Initial schema for AI Career OS on Supabase Postgres.
-- Translates prisma/schema.prisma (now removed) 1:1, with ownerId -> owner_id
-- uuid referencing auth.users(id) so Row Level Security replaces the
-- previously-planned app-level ownerId scoping helper (see ADR-009).

create type application_status as enum ('APPLIED', 'HR', 'TECHNICAL', 'TEAM', 'CEO_OR_MANAGER');
create type post_status as enum ('DRAFT', 'SCHEDULED', 'SENT');
create type offer_source as enum ('URL', 'RAW_TEXT');

create table profiles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users (id),

  summary text not null,
  skills text[] not null,
  experience jsonb not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table job_offers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id),

  url text,
  source offer_source not null,
  raw_content text not null,
  company text not null,
  title text not null,
  description text not null,
  match_score integer,
  is_favorite boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index job_offers_owner_id_idx on job_offers (owner_id);

create table cv_documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id),

  is_master boolean not null default false,
  content text not null,

  job_offer_id uuid references job_offers (id),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index cv_documents_owner_id_idx on cv_documents (owner_id);
create index cv_documents_job_offer_id_idx on cv_documents (job_offer_id);

-- job_offers.tailoredCvs in the old Prisma schema was the inverse side of
-- cv_documents.job_offer_id — no separate column needed.

create table applications (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id),

  job_offer_id uuid not null references job_offers (id),
  sent_cv_id uuid not null references cv_documents (id),

  recruiter_message text not null,
  status application_status not null default 'APPLIED',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index applications_owner_id_idx on applications (owner_id);
create index applications_job_offer_id_idx on applications (job_offer_id);
create index applications_sent_cv_id_idx on applications (sent_cv_id);

create table posts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id),

  content text not null,
  status post_status not null default 'DRAFT',
  scheduled_at timestamptz,
  sent_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index posts_owner_id_idx on posts (owner_id);

-- Row Level Security: every table is scoped to its owner via auth.uid().
-- This is the single-user MVP's entire authorization model (ADR-005/ADR-009)
-- — no app-level ownerId scoping helper needed.
alter table profiles enable row level security;
alter table job_offers enable row level security;
alter table cv_documents enable row level security;
alter table applications enable row level security;
alter table posts enable row level security;

create policy "owner_all" on profiles for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "owner_all" on job_offers for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "owner_all" on cv_documents for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "owner_all" on applications for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "owner_all" on posts for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
