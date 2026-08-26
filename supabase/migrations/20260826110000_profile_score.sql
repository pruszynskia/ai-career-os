-- Automatic CV-quality score, computed by the same AI call that parses the CV (TASK-042).
alter table profiles add column score jsonb;
