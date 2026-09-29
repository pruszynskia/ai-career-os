import Link from 'next/link';

import { Button } from '@/shared/ui/button';
import { HStack } from '@/shared/ui/primitives';

// Takes isSignedIn as a prop (rather than checking auth itself) so a single
// /pricing render shares one auth lookup with PricingTable instead of each
// component doing its own createClient()/getUser() round-trip.
export function SignedInHeader({ isSignedIn }: { isSignedIn: boolean }) {
  if (!isSignedIn) return null;

  return (
    <HStack justify="end" className="w-full">
      <Button asChild variant="primary">
        <Link href="/dashboard">Go to dashboard</Link>
      </Button>
    </HStack>
  );
}
