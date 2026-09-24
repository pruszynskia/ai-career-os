'use client';

import Link from 'next/link';
import { useEffect } from 'react';

import { Button, buttonVariants } from '@/shared/ui/button';
import { Heading, Text } from '@/shared/ui/primitives';
import { cn } from '@/shared/ui/utils';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <Text size="sm" weight="medium" color="muted" className="font-mono">
        Error
      </Text>
      <Heading level={2} as="h1">
        Something went wrong
      </Heading>
      <Text color="muted">
        An unexpected error occurred. Try again, or head back to the dashboard.
      </Text>
      <div className="mt-2 flex items-center gap-2">
        <Button onClick={reset} size="md">
          Try again
        </Button>
        <Link
          href="/dashboard"
          className={cn(buttonVariants({ size: 'md', variant: 'secondary' }))}
        >
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
