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
    <main className="flex min-h-screen flex-col">
      <header className="flex h-16 shrink-0 items-center border-b px-8">
        <Link href="/">
          <Heading level={3}>Career OS</Heading>
        </Link>
      </header>
      <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-3.5 px-6 text-center">
        <Text size="sm" weight="medium" color="muted" className="tabular-nums">
          Error
        </Text>
        <Heading level={1} as="h1">
          Something went wrong
        </Heading>
        <Text color="muted">
          An unexpected error occurred. Try again, or head back to the
          dashboard.
        </Text>
        <div className="mt-2 flex items-center gap-2">
          <Button onClick={reset} size="lg">
            Try again
          </Button>
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ size: 'lg', variant: 'secondary' }))}
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
