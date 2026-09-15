import { redirect } from 'next/navigation';

import { profileService } from '@/entities/profile/service';
import { getOwnerId } from '@/shared/auth/session';

// Wraps every route that requires onboarding to be complete. /onboarding and
// /settings live outside this group (as siblings under src/app/(app)) so they
// stay reachable while onboarding is incomplete.
//
// This redirects server-side, before any protected page renders — replacing
// the former client-side OnboardingGate, which rendered the gated page once
// and discarded it. A route group is what makes the exemption possible
// without a pathname lookup: Next.js Server Components (and layouts) have no
// API to read the current pathname — that requires either `usePathname()` in
// a Client Component (the flash this replaces) or a header set by
// src/proxy.ts (out of scope here, and it would add a Supabase call to every
// matched request, not just these five routes).
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ownerId = await getOwnerId();
  const onboardedAt = await profileService.getOnboardedAt(ownerId);

  if (!onboardedAt) redirect('/onboarding');

  return <>{children}</>;
}
