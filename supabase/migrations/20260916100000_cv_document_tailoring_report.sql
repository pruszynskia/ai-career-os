-- Tailoring report - posting keyword coverage and evidence trace (TASK-082).
-- Additive and nullable: CVs generated before this migration keep their
-- content and simply have tailoring_report = null.
alter table cv_documents add column tailoring_report jsonb;
