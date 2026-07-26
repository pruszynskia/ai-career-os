-- Cascade post deletion when a campaign is removed, so the rollback in
-- generate-campaign.service.ts (deleting a partially-created campaign after
-- a mid-batch post-creation failure) can't be blocked by a foreign-key
-- violation from sibling posts that did succeed.

alter table posts drop constraint posts_campaign_id_fkey;
alter table posts add constraint posts_campaign_id_fkey
  foreign key (campaign_id) references post_campaigns (id) on delete cascade;
