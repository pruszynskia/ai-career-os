-- Job preference fields on profiles (TASK-033).
create type work_mode as enum ('REMOTE', 'HYBRID', 'ONSITE');
create type employment_type as enum ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE');
create type seniority_level as enum ('JUNIOR', 'MID', 'SENIOR', 'LEAD', 'PRINCIPAL');
create type company_size as enum ('STARTUP', 'SCALEUP', 'MID_SIZE', 'ENTERPRISE');

alter table profiles
  add column work_mode work_mode,
  add column salary_min integer,
  add column salary_max integer,
  add column salary_currency text,
  add column specialization text,
  add column employment_type employment_type,
  add column seniority seniority_level,
  add column preferred_technologies text[],
  add column company_size company_size,
  add column industries text[],
  add column location_preferences text[];
