'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

import { useUploadCv } from '@/features/cv/hooks/use-upload-cv';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

export function CvUploadForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const mutation = useUploadCv();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!file) return;

    mutation.mutate(file, {
      onSuccess: () => {
        setFile(null);
        if (inputRef.current) inputRef.current.value = '';
        router.refresh();
      },
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label htmlFor="cv-file" className="text-sm font-medium">
        Upload CV (PDF or DOCX)
      </label>
      <Input
        id="cv-file"
        ref={inputRef}
        type="file"
        accept=".pdf,.docx"
        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        disabled={mutation.isPending}
      />
      <Button
        type="submit"
        disabled={!file || mutation.isPending}
        className="self-start"
      >
        {mutation.isPending ? 'Uploading…' : 'Upload CV'}
      </Button>
      {mutation.isError && (
        <p role="alert" className="text-sm text-destructive">
          {mutation.error.message}
        </p>
      )}
    </form>
  );
}
