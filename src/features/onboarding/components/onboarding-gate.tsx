'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

// The account's own /onboarding page and /settings stay reachable while
// onboarding is incomplete; every other (app) route bounces to /onboarding.
const EXEMPT_PATHS = ['/onboarding', '/settings'];

function isExemptPath(pathname: string): boolean {
  return EXEMPT_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

// ponytail: client-side redirect — the gated page's server components still
// render once and are discarded, with one blank frame pre-hydration. A
// pathname-aware server redirect only exists in src/proxy.ts (out of
// TASK-060 scope); move it there if the wasted render matters, at the cost
// of a Supabase query on every matched request. Confirmed accounts land on
// /dashboard, so this happens once per account.
export function OnboardingGate({
  needsOnboarding,
  children,
}: {
  needsOnboarding: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isExempt = isExemptPath(pathname);
  const shouldRedirect = needsOnboarding && !isExempt;

  useEffect(() => {
    if (shouldRedirect) router.replace('/onboarding');
  }, [shouldRedirect, router]);

  if (shouldRedirect) return null;

  return <>{children}</>;
}
