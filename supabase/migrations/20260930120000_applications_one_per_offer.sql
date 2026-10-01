-- One tracked application per job offer, and status history written by the
-- database instead of best-effort app code.
--
-- Until now "duplicate-free" was only an app-level hope: nothing stopped a
-- second application for the same offer (Track → Back → Track, or a board
-- re-drag before router.refresh() landed). The UI only ever shows the newest
-- one, so older duplicates were invisible yet kept feeding nudges and
-- dashboard counts.

-- 1. Keep the newest application per offer. Their status events go with them
--    (application_status_events.application_id is ON DELETE CASCADE).
delete from applications a
using applications newer
where newer.job_offer_id = a.job_offer_id
  and (newer.created_at, newer.id) > (a.created_at, a.id);

-- 2. Enforce it. The unique index replaces the plain lookup index.
drop index applications_job_offer_id_idx;
create unique index applications_job_offer_id_key on applications (job_offer_id);

-- 3. Record every status an application enters, atomically with the write
--    that set it. Replaces the app-side inserts in create-application and
--    update-status, which could silently diverge from applications.status.
--    Runs as the invoking user, so the owner_all RLS policy still applies.
create function record_application_status_event() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  insert into public.application_status_events (owner_id, application_id, status)
  values (new.owner_id, new.id, new.status);
  return new;
end;
$$;

create trigger applications_status_event_insert
after insert on applications
for each row
execute function record_application_status_event();

create trigger applications_status_event_update
after update of status on applications
for each row
when (old.status is distinct from new.status)
execute function record_application_status_event();
