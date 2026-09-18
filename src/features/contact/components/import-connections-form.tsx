'use client';

import { useRef, useState } from 'react';

import { useImportConnections } from '@/features/contact/hooks/use-import-connections';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label, Spinner, Text } from '@/shared/ui/primitives';

// Imports the "Connections.csv" file from the user's own LinkedIn data
// export - never a scrape or a LinkedIn API call (do_not, TASK-084).
export function ImportConnectionsForm() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const mutation = useImportConnections();

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
      <Label htmlFor="connections-file">
        Import LinkedIn connections (CSV)
      </Label>
      <Text size="sm" color="muted">
        Export &quot;Connections.csv&quot; from LinkedIn (Settings &amp; Privacy
        → Get a copy of your data) and upload it here.
      </Text>
      <Input
        id="connections-file"
        ref={inputRef}
        type="file"
        accept=".csv"
        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        disabled={mutation.isPending}
      />
      <Button
        type="submit"
        disabled={!file || mutation.isPending}
        className="self-start"
      >
        {mutation.isPending && <Spinner size="sm" />}
        {mutation.isPending ? 'Importing…' : 'Import connections'}
      </Button>
    </form>
  );
}
