-- Personal/side projects extracted from CV, distinct from work experience (TASK-041).
alter table profiles add column projects jsonb not null default '[]'::jsonb;
