-- Warm contacts - LinkedIn connections import and the per-company interlock
-- (TASK-084). TASK-083 blocks recruiter-addressed drafts when no contact is
-- on file, which was every offer, because no contacts entity existed yet
-- (ADR-020 noted this table could be layered in later without changing the
-- outreach contract). This is that table: owner-scoped rows the user
-- imports from their own LinkedIn "Connections" data export, or adds by
-- hand, classified by job title with no AI call (classify-title.ts).

create type contact_classification as enum (
  'non-it',
  'generalist',
  'it-recruiter',
  'decision-maker'
);

create table contacts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id),

  name text not null,
  company text not null,
  -- Lowercased/punctuation-stripped company, written by the app
  -- (normalizeText in shared/utils/offer-fingerprint.ts) alongside every
  -- insert. findByCompany filters on this column rather than pulling every
  -- row for the owner into JS and filtering there, which would silently
  -- truncate at config.toml's max_rows (1000) for any network bigger than
  -- that.
  normalized_company text not null,
  title text not null,
  profile_url text,
  classification contact_classification not null,
  -- Always true for an imported row (LinkedIn's own export only ever lists
  -- first-degree connections); a manually added contact defaults to true
  -- too, since the user only adds people they actually know.
  first_degree boolean not null default true,

  created_at timestamptz not null default now()
);

create index contacts_owner_id_idx on contacts (owner_id);
create index contacts_owner_company_idx on contacts (owner_id, normalized_company);

-- Re-importing a refreshed LinkedIn export must not duplicate every row.
-- profile_url is the one stable identifier LinkedIn's export gives us;
-- manually added contacts may have no profile_url at all, and NULL is
-- never considered equal to NULL by a unique index, so this only dedupes
-- rows that actually carry a URL.
create unique index contacts_owner_profile_url_key
  on contacts (owner_id, profile_url)
  where profile_url is not null;

alter table contacts enable row level security;

create policy "owner_all" on contacts for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- contacts.owner_id carries no ON DELETE CASCADE, same as every other
-- owner-scoped table - delete_own_account() (TASK-065, extended for
-- outreach_messages in the migration right before this one) must delete it
-- before auth.users or account deletion 500s with a foreign-key violation
-- for any account holding a contact.
create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'delete_own_account() requires an authenticated caller';
  end if;

  delete from public.application_status_events where owner_id = uid;
  delete from public.applications where owner_id = uid;
  delete from public.outreach_messages where owner_id = uid;
  delete from public.contacts where owner_id = uid;
  delete from public.cv_documents where owner_id = uid;
  delete from public.job_offers where owner_id = uid;
  delete from public.posts where owner_id = uid;
  delete from public.post_campaigns where owner_id = uid;
  delete from public.ai_usage where owner_id = uid;
  delete from public.subscriptions where owner_id = uid;
  delete from public.profiles where owner_id = uid;
  delete from auth.users where id = uid;
end;
$$;
