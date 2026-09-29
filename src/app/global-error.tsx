'use client';

import Link from 'next/link';
import { useEffect } from 'react';

import { Button, buttonVariants } from '@/shared/ui/button';
import { Heading, Text } from '@/shared/ui/primitives';
import { cn } from '@/shared/ui/utils';

// Next.js requires global-error.tsx to render its own <html>/<body> because
// it replaces the entire root layout (src/app/layout.tsx), so it can only
// catch errors thrown by the root layout itself - error.tsx cannot.
//
// ponytail: root layout's next/font variables never land on this <html> (the
// font loader only runs in the server-rendered root layout it's replacing),
// so this falls back to the browser default sans-serif instead of Geist -
// acceptable for a screen only a root-layout crash reaches.
export default function GlobalError({
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
    <html lang="en">
      <body>
        <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-3.5 px-6 text-center">
          <Text
            size="sm"
            weight="medium"
            color="muted"
            className="tabular-nums"
          >
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
              className={cn(
                buttonVariants({ size: 'lg', variant: 'secondary' }),
              )}
            >
              Back to dashboard
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
