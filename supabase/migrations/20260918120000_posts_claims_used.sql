-- Claim ids each post was built on (TASK-087, ADR-017), so post generation
-- reads the same evidence base as CV tailoring, cover letters and outreach,
-- and reused claims are visible on the post list. Empty default keeps
-- existing rows valid without a backfill.
alter table posts
  add column claims_used text[] not null default '{}';
