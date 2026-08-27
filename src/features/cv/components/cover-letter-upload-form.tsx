'use client';

import { DocumentUploadForm } from '@/features/cv/components/document-upload-form';
import { useUploadCoverLetter } from '@/features/cv/hooks/use-upload-cover-letter';

export function CoverLetterUploadForm() {
  const mutation = useUploadCoverLetter();

  return (
    <DocumentUploadForm
      id="cover-letter-file"
      label="Upload cover letter (PDF or DOCX)"
      submitLabel="Upload cover letter"
      submitPendingLabel="Uploading…"
      mutation={mutation}
    />
  );
}
