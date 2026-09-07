import Link from 'next/link';

import { buttonVariants } from '@/shared/ui/button';
import { cn } from '@/shared/ui/utils';

// Rendered on demand, never prerendered: the production CSP in src/proxy.ts
// binds script execution to a per-request nonce, and a statically prerendered
// page has no request and therefore no nonce, so its inline bootstrap scripts
// would be blocked. Forcing dynamic rendering lets Next stamp the nonce.
export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-sm text-muted-foreground">
        The page you are looking for does not exist or has moved.
      </p>
      <Link href="/" className={cn(buttonVariants({ size: 'lg' }), 'mt-2')}>
        Back to home
      </Link>
    </main>
  );
}
