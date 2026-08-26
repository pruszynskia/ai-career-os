-- Distinguish CvDocument variants for the documents list (TASK-038).
-- is_master + job_offer_id alone can't tell a tailored CV apart from a
-- cover letter (both isMaster:false, jobOfferId set), so add an explicit kind.
create type cv_document_kind as enum ('MASTER', 'OPTIMIZED', 'TAILORED', 'COVER_LETTER');

alter table cv_documents add column kind cv_document_kind;

update cv_documents
set kind = case
  when is_master then 'MASTER'
  when job_offer_id is not null then 'TAILORED'
  else 'OPTIMIZED'
end::cv_document_kind;

alter table cv_documents alter column kind set not null;
