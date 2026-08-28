'use client';

import { useState } from 'react';

import { useUpdateApplicationNotes } from '@/features/application/hooks/use-update-application-notes';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Textarea } from '@/shared/ui/textarea';
import { Spinner } from '@/shared/ui/primitives';

export function ApplicationNotes({
  applicationId,
  initialNotes,
}: {
  applicationId: string;
  initialNotes: string | null;
}) {
  const [notes, setNotes] = useState(initialNotes ?? '');
  const updateNotesMutation = useUpdateApplicationNotes();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recruiter notes</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Textarea
          aria-label="Recruiter notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={6}
          maxLength={10_000}
          placeholder="Recruiter-call notes, salary ranges, follow-ups…"
          disabled={updateNotesMutation.isPending}
        />
        <Button
          variant="secondary"
          className="self-start"
          disabled={updateNotesMutation.isPending}
          onClick={() =>
            updateNotesMutation.mutate({ id: applicationId, notes })
          }
        >
          {updateNotesMutation.isPending && <Spinner size="sm" />}
          {updateNotesMutation.isPending ? 'Saving…' : 'Save notes'}
        </Button>
      </CardContent>
    </Card>
  );
}
