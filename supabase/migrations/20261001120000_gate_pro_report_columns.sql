-- ADR-025: Pro-only payloads (job_offers.fit, cv_documents.tailoring_report)
-- are no longer readable by the signed-in user over PostgREST. Server code
-- reads them via the service-role client after an RLS-scoped owner read
-- (src/shared/db/gated-columns.ts); plan gating stays at response boundaries.
--
-- Supabase grants table-level SELECT, so `revoke select (col)` alone is a
-- no-op: revoke the table grant and re-grant every other column instead.
-- Any column added to these tables later needs its own
-- `grant select (col) on ... to authenticated`, or the app can't read it.
-- INSERT/UPDATE/DELETE stay table-level, so writes of the gated columns work.

revoke select on public.job_offers from anon, authenticated;
grant select (
  id, owner_id, url, source, raw_content, company, title, description,
  match_score, is_favorite, created_at, updated_at, expires_at
) on public.job_offers to authenticated;

revoke select on public.cv_documents from anon, authenticated;
grant select (
  id, owner_id, is_master, content, job_offer_id, created_at, updated_at, kind
) on public.cv_documents to authenticated;
