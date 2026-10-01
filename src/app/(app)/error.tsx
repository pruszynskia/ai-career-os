'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/shared/ui/button';
import { Heading, Text } from '@/shared/ui/primitives';

// Segment-scoped (ERR-5): without this, any error thrown by a page under
// (app) bubbled to the root error.tsx, which replaces everything below the
// root layout - wiping the sidebar/top bar along with the page. This
// boundary only replaces the page content, keeping nav intact.
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-3.5 px-6 py-16 text-center">
      <Text size="sm" weight="medium" color="muted" className="tabular-nums">
        Error
      </Text>
      <Heading level={1} as="h1">
        Something went wrong
      </Heading>
      <Text color="muted">This page hit an unexpected error. Try again.</Text>
      <Button
        onClick={() => {
          // reset() alone re-renders with the same server data that just
          // threw; refresh() re-fetches it first so a transient failure
          // (a dropped connection, a stale session) actually gets a
          // second chance instead of throwing again immediately.
          router.refresh();
          reset();
        }}
        size="lg"
        className="mt-2"
      >
        Try again
      </Button>
    </div>
  );
}
