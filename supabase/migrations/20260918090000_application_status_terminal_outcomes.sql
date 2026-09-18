-- Terminal application outcomes (TASK-085). application_status only ever
-- ran APPLIED, HR, TECHNICAL, TEAM, CEO_OR_MANAGER - every value a stage,
-- none an outcome - so a rejected, offered or silently-dead application had
-- nowhere to go. Add the four terminal values, using add value if not
-- exists (same pattern as
-- 20260826120000_cv_document_optimized_cover_letter_kind.sql) so a later
-- `supabase db push` replay is idempotent.
--
-- EXPIRED stays distinct from REJECTED: a pulled listing means no decision
-- was made about the candidate either way, and collapsing the two would
-- corrupt every response-rate number built on top of them.
alter type application_status add value if not exists 'OFFER';
alter type application_status add value if not exists 'REJECTED';
alter type application_status add value if not exists 'NO_RESPONSE';
alter type application_status add value if not exists 'EXPIRED';
