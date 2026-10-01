-- Atomic AI-action metering.
--
-- The metered accessor counted usage, ran a 5-60s AI call, then inserted the
-- row - so N parallel requests at limit-1 all passed the count and all got
-- recorded. record_ai_action serialises per owner (advisory lock held for the
-- transaction), re-counts, and inserts only while under the limit.
-- Runs as the invoking user: auth.uid() scopes it and RLS still applies.

create function record_ai_action(p_action text, p_provider text, p_limit int)
returns void
language plpgsql
set search_path = ''
as $$
declare
  used int;
begin
  perform pg_advisory_xact_lock(hashtext('ai_usage:' || auth.uid()::text));

  select count(*) into used
  from public.ai_usage
  where owner_id = auth.uid()
    and created_at >= date_trunc('month', now() at time zone 'utc') at time zone 'utc';

  if used >= p_limit then
    raise exception 'ai_limit_reached' using errcode = 'P0001';
  end if;

  insert into public.ai_usage (owner_id, action, provider)
  values (auth.uid(), p_action, p_provider);
end;
$$;

-- Usage rows are an append-only ledger: owners may read and add their own,
-- but not update or delete them (owner_all allowed resetting the quota by
-- deleting rows or back-dating created_at).
drop policy "owner_all" on ai_usage;
create policy "owner_select" on ai_usage for select using (owner_id = auth.uid());
create policy "owner_insert" on ai_usage for insert with check (owner_id = auth.uid());
