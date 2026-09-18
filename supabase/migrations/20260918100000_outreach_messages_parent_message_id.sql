-- Follow-up nudges (TASK-086): a follow-up draft must link back to the
-- outreach_messages row it follows up on, so the notification center and
-- any future thread view can tell a follow-up from an original send.

alter table outreach_messages
  add column parent_message_id uuid references outreach_messages (id);

create index outreach_messages_parent_message_id_idx
  on outreach_messages (parent_message_id);
