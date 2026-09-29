-- Performance fix only (TASK-064 follow-up): contacts and outreach_messages
-- were added after the nine-table auth_rls_initplan sweep in
-- 20260920090000_rls_auth_uid_initplan.sql and were missed. Same fix here —
-- wrap the bare auth.uid() call in a scalar sub-select so Postgres evaluates
-- it once per query (InitPlan) instead of once per row. Each policy below is
-- semantically identical to the one it replaces — same command scope, same
-- owner_id predicate.

drop policy "owner_all" on contacts;
create policy "owner_all" on contacts for all using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));

drop policy "owner_all" on outreach_messages;
create policy "owner_all" on outreach_messages for all using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
