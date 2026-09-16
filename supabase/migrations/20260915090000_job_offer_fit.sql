-- Nine-criteria fit assessment, kept alongside the existing match_score
-- headline integer (TASK-079). Additive and nullable: offers scored before
-- this migration keep match_score and simply have fit = null.
alter table job_offers add column fit jsonb;
