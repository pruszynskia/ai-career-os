'use client';

import { DocumentUploadForm } from '@/features/cv/components/document-upload-form';
import { useUploadCv } from '@/features/cv/hooks/use-upload-cv';

export function CvUploadForm() {
  const mutation = useUploadCv();

  return (
    <DocumentUploadForm
      id="cv-file"
      label="Upload CV (PDF or DOCX)"
      submitLabel="Upload CV"
      submitPendingLabel="Uploading…"
      mutation={mutation}
    />
  );
}
