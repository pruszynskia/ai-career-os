-- Which adapter actually served each AI action (TASK-089's cross-provider
-- fallback chain in src/shared/ai/service.ts). Nullable: existing rows and
-- any deploy without the fallback env vars configured never set it.
alter table ai_usage
  add column provider text;
