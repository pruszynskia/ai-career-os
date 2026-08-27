'use client';

import { useRef, useState } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';

import { Spinner } from '@/shared/ui/primitives';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

// Shared by CvUploadForm and CoverLetterUploadForm — both upload a PDF/DOCX
// file and differ only in labels and which mutation they call.
export function DocumentUploadForm({
  id,
  label,
  submitLabel,
  submitPendingLabel,
  mutation,
}: {
  id: string;
  label: string;
  submitLabel: string;
  submitPendingLabel: string;
  mutation: UseMutationResult<unknown, Error, File>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!file) return;

    mutation.mutate(file, {
      onSuccess: () => {
        setFile(null);
        if (inputRef.current) inputRef.current.value = '';
      },
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <Input
        id={id}
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
        {mutation.isPending && <Spinner size="sm" />}
        {mutation.isPending ? submitPendingLabel : submitLabel}
      </Button>
    </form>
  );
}
