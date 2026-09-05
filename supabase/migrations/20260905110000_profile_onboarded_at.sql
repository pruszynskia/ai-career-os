-- TASK-060: a profiles row can now exist before any CV is parsed (skip or
-- finish onboarding). A NULL summary is that state; every parsed CV writes a
-- string, so a real profile and a pre-CV row can never be confused.
-- isPlaceholder() in src/entities/profile/service.ts keys on summary IS NULL.
alter table profiles
  alter column summary drop not null,
  alter column skills set default '{}',
  alter column experience set default '[]'::jsonb;

alter table profiles add column onboarded_at timestamptz;

-- Existing accounts are already activated.
update profiles set onboarded_at = created_at where onboarded_at is null;

-- Pre-existing accounts that never uploaded a CV have no profiles row and
-- would otherwise be routed into onboarding. Only confirmed accounts are
-- backfilled; an unconfirmed signup still goes through onboarding when it
-- confirms its email.
insert into profiles (owner_id, onboarded_at)
select u.id, now()
from auth.users u
where not exists (select 1 from profiles p where p.owner_id = u.id)
  and u.confirmed_at is not null;
