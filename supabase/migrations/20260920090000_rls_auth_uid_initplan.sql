-- Performance fix only (TASK-064): the Supabase performance advisor flags
-- auth_rls_initplan on every owner_all/owner_read policy below because a
-- bare auth.uid() is re-evaluated once per row instead of once per query.
-- Wrapping it in a scalar sub-select (select auth.uid()) lets Postgres
-- evaluate it once per query (InitPlan) instead. Each policy below is
-- semantically identical to the one it replaces — same command scope, same
-- owner_id predicate — only the auth.uid() call changes. subscriptions
-- keeps its select-only owner_read policy from ADR-015.

drop policy "owner_all" on profiles;
create policy "owner_all" on profiles for all using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));

drop policy "owner_all" on job_offers;
create policy "owner_all" on job_offers for all using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));

drop policy "owner_all" on cv_documents;
create policy "owner_all" on cv_documents for all using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));

drop policy "owner_all" on applications;
create policy "owner_all" on applications for all using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));

drop policy "owner_all" on posts;
create policy "owner_all" on posts for all using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));

drop policy "owner_all" on post_campaigns;
create policy "owner_all" on post_campaigns for all using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));

drop policy "owner_all" on application_status_events;
create policy "owner_all" on application_status_events for all using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));

drop policy "owner_all" on ai_usage;
create policy "owner_all" on ai_usage for all using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));

drop policy "owner_read" on subscriptions;
create policy "owner_read" on subscriptions for select using (owner_id = (select auth.uid()));
