import Link from 'next/link';

import { Button } from '@/shared/ui/button';
import { Heading, Text } from '@/shared/ui/primitives';

// Rendered on demand, never prerendered: the production CSP in src/proxy.ts
// binds script execution to a per-request nonce, and a statically prerendered
// page has no request and therefore no nonce, so its inline bootstrap scripts
// would be blocked. Forcing dynamic rendering lets Next stamp the nonce.
export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col">
      <header className="flex h-16 shrink-0 items-center border-b px-8">
        <Link href="/">
          <Heading level={3}>Career OS</Heading>
        </Link>
      </header>
      <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-3.5 px-6 text-center">
        <Text size="sm" weight="medium" color="muted" className="tabular-nums">
          404
        </Text>
        <Heading level={1} as="h1">
          Page not found
        </Heading>
        <Text color="muted">
          The page you are looking for does not exist or has moved.
        </Text>
        <Button asChild size="lg" className="mt-2">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </main>
  );
}
