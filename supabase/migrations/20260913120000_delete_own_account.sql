-- Account deletion (TASK-065). owner_id foreign keys carry no
-- `on delete cascade`, so `auth.admin.deleteUser()` alone would leave every
-- owner-scoped row orphaned, and routing deletion through
-- createAdminClient() would add a second service-role request-path caller,
-- which ADR-015 forbids (the Stripe webhook is the only one). Instead this
-- SECURITY DEFINER function is called with the ordinary request client via
-- supabase.rpc('delete_own_account') — it runs with elevated privileges
-- just for the duration of the call, keyed on auth.uid(), so it needs no
-- second admin caller.
--
-- Deletes children before parents (application_status_events references
-- applications, applications references job_offers and cv_documents, posts
-- references post_campaigns) and finally the caller's own auth.users row,
-- all in one transaction.

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

revoke execute on function public.delete_own_account() from public;
revoke execute on function public.delete_own_account() from anon;
grant execute on function public.delete_own_account() to authenticated;
