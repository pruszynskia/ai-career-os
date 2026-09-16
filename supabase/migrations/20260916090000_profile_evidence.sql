-- Verified evidence base every generator will draw claims from (TASK-078,
-- ADR-017). Additive, following the existing `score jsonb` column: skills,
-- experience, projects and score are untouched. Defaults to an empty base
-- so profiles created before this migration load without error.
alter table profiles
  add column evidence jsonb not null default '{"claims": [], "neverInclude": [], "alwaysIncludeWhenRelevant": []}'::jsonb;
