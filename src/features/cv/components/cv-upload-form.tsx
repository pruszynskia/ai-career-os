'use client';

import { type DragEvent, useRef, useState } from 'react';
import { FileText, Upload, X } from 'lucide-react';

import { useUploadCv } from '@/features/cv/hooks/use-upload-cv';
import { Banner } from '@/shared/ui/banner';
import { Button } from '@/shared/ui/button';
import { IconButton, Spinner, Text, VStack } from '@/shared/ui/primitives';
import { cn } from '@/shared/ui/utils';

const SUPPORTED_EXTENSIONS = ['.pdf', '.docx'];

// Extension-only check, matching the input's own accept filter - no content
// sniffing. Exported for unit testing.
export function isSupportedCvFile(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  return SUPPORTED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export function CvUploadForm() {
  const mutation = useUploadCv();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [typeError, setTypeError] = useState<string | null>(null);

  // There's no chunked/streamed upload to report real progress for
  // (uploadCv is a single server-side call) - isPending/isSuccess is an
  // indeterminate "busy" state, not a fake percentage. isSuccess keeps the
  // busy UI up until router.refresh() (in useUploadCv's onSuccess) swaps
  // this form out for the server-read done summary, so there's no flash of
  // the idle dropzone in between.
  const busy = mutation.isPending || mutation.isSuccess;

  function acceptFile(selected: File | null) {
    if (!selected) return;
    mutation.reset();
    setFile(selected);
    setTypeError(
      isSupportedCvFile(selected.name)
        ? null
        : 'Unsupported file type. Upload a PDF or DOCX file.',
    );
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    if (busy) return;
    acceptFile(event.dataTransfer.files?.[0] ?? null);
  }

  function handleRemove() {
    setFile(null);
    setTypeError(null);
    mutation.reset();
    if (inputRef.current) inputRef.current.value = '';
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!file || typeError || busy) return;
    mutation.mutate(file);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <VStack gap={1}>
        <Text as="span" size="sm" weight="medium">
          Upload CV (PDF or DOCX)
        </Text>
        <Text size="xs" color="muted">
          Your CV becomes the verified record every tailored CV, message and
          post is generated from.
        </Text>
      </VStack>

      {mutation.isError && (
        <Banner tone="danger">{mutation.error.message}</Banner>
      )}
      {typeError && <Banner tone="danger">{typeError}</Banner>}

      {!file && (
        <label
          htmlFor="cv-file"
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
          className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-input bg-muted/30 p-4"
        >
          <Upload
            aria-hidden="true"
            className="size-5 shrink-0 text-muted-foreground"
          />
          <span className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">
              Drop your CV here, or <span className="text-primary">browse</span>
            </span>
            <span className="text-xs text-muted-foreground">PDF or DOCX</span>
          </span>
          <input
            id="cv-file"
            ref={inputRef}
            type="file"
            accept=".pdf,.docx"
            className="sr-only"
            onChange={(event) => acceptFile(event.target.files?.[0] ?? null)}
          />
        </label>
      )}

      {file && (
        <div
          className={cn(
            'flex items-center gap-3 rounded-lg border p-3',
            typeError ? 'border-destructive' : 'border-input',
          )}
        >
          <FileText
            aria-hidden="true"
            className={cn(
              'size-4 shrink-0',
              typeError ? 'text-destructive' : 'text-muted-foreground',
            )}
          />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium">{file.name}</span>
            <span
              className={cn(
                'text-xs',
                typeError ? 'text-destructive' : 'text-muted-foreground',
              )}
            >
              {typeError
                ? 'Not a PDF or DOCX'
                : busy
                  ? 'Reading your experience, skills and projects…'
                  : 'Ready to upload'}
            </span>
          </span>
          {!busy && (
            <IconButton
              type="button"
              aria-label="Remove file"
              variant="quiet"
              onClick={handleRemove}
            >
              <X aria-hidden="true" />
            </IconButton>
          )}
        </div>
      )}

      <div>
        <Button type="submit" disabled={!file || !!typeError || busy}>
          {busy && <Spinner size="sm" />}
          {busy ? 'Uploading…' : 'Upload CV'}
        </Button>
      </div>
    </form>
  );
}
