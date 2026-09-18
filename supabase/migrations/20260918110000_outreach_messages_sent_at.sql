-- Follow-up nudges (TASK-086), round 2: findLatestByJobOffer prefers a
-- SENT row so a follow-up targets the channel actually used, but all three
-- channel drafts share one created_at from a single createMany insert -
-- copying more than one channel for the same offer left "which one is the
-- real latest" a tie broken by row id. sent_at records when a row was
-- actually marked sent, giving that tie a real answer.

alter table outreach_messages
  add column sent_at timestamptz;

update outreach_messages set sent_at = created_at where status = 'SENT';
