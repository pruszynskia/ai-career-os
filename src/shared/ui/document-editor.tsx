'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { updateDocument } from '@/shared/api/document';
import { downloadTextFile } from '@/shared/utils/download-text-file';
import { Spinner } from '@/shared/ui/primitives';
import { Button } from '@/shared/ui/button';
import { Textarea } from '@/shared/ui/textarea';

export function DocumentEditor({
  documentId,
  content,
  downloadFilename,
  onSaved,
}: {
  documentId: string;
  content: string;
  downloadFilename: string;
  onSaved?: (content: string) => void;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState(content);
  const saveMutation = useMutation({
    mutationFn: () => updateDocument(documentId, draft),
    onSuccess: ({ cvDocument }) => {
      toast.success('Document saved');
      router.refresh();
      onSaved?.(cvDocument.content);
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <div className="flex flex-col gap-3">
      <Textarea
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        rows={10}
        disabled={saveMutation.isPending}
      />
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={saveMutation.isPending || draft === content}
          onClick={() => saveMutation.mutate()}
        >
          {saveMutation.isPending && <Spinner size="sm" />}
          {saveMutation.isPending ? 'Saving…' : 'Save'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => downloadTextFile(downloadFilename, draft)}
        >
          Download
        </Button>
      </div>
    </div>
  );
}
