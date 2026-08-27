-- Optimizing the master cover letter (TASK-043) was tagging its output
-- kind:'OPTIMIZED', the same value optimize-cv uses for an optimized CV —
-- collapsing the distinction the kind column exists to preserve. Add a
-- dedicated value instead of reusing the CV one.
-- `if not exists` because this was applied out-of-band (recorded upstream as
-- version 20260827054509, not this file's 20260826120000), so a later
-- `supabase db push` would otherwise re-run it and fail on the duplicate label.
alter type cv_document_kind add value if not exists 'OPTIMIZED_COVER_LETTER';
