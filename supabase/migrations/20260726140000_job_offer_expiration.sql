-- Offer expiration (TASK-030): user-set/defaulted expiry, isExpired is
-- computed on read in jobOfferService, not stored here.
alter table job_offers add column expires_at timestamptz;
