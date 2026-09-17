-- Outreach studio (TASK-083) added outreach_messages, which references
-- job_offers and auth.users with no ON DELETE CASCADE - consistent with
-- every other owner-scoped table, all of which rely on
-- delete_own_account() deleting children before parents rather than on FK
-- cascade. That function was not updated when outreach_messages was added,
-- so account deletion started failing with a foreign-key violation for any
-- account holding an outreach draft. Delete outreach_messages before
-- job_offers, same as every other job_offers child.

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
