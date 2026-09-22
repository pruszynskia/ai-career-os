import Link from 'next/link';

import { buttonVariants } from '@/shared/ui/button';
import { Heading, Text } from '@/shared/ui/primitives';
import { cn } from '@/shared/ui/utils';

// Rendered on demand, never prerendered: the production CSP in src/proxy.ts
// binds script execution to a per-request nonce, and a statically prerendered
// page has no request and therefore no nonce, so its inline bootstrap scripts
// would be blocked. Forcing dynamic rendering lets Next stamp the nonce.
export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <Text size="sm" weight="medium" color="muted" className="font-mono">
        404
      </Text>
      <Heading level={2} as="h1">
        Page not found
      </Heading>
      <Text color="muted">
        The page you are looking for does not exist or has moved.
      </Text>
      <Link
        href="/"
        className={cn(buttonVariants({ size: 'comfortable' }), 'mt-2')}
      >
        Back to home
      </Link>
    </main>
  );
}
