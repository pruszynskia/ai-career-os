-- Free-text recruiter notes on applications (TASK-052).
-- One nullable column, no history table: the row's updated_at is the only
-- timestamp. applications.recruiter_message stays the AI-generated outbound
-- message; this column is separate, manually written notes (recruiter-call
-- notes, salary ranges, follow-ups).

alter table applications add column notes text;
