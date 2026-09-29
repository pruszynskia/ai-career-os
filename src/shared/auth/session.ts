import 'server-only';
import { cache } from 'react';

import { createClient } from '@/shared/db/client';

// Single-user MVP (ADR-003/ADR-009): the one Supabase Auth user is the owner.
// Proxy already redirects unauthenticated requests to /sign-in, so any
// route handler, server action or page reaching this has a session.
//
// cache() dedupes this per request: (app)/layout.tsx, (protected)/layout.tsx
// and every page.tsx call getOwnerId() independently, and supabase.auth.
// getUser() is a real network round trip (it revalidates against Supabase
// Auth, unlike getSession()) - without this, one navigation fired that round
// trip 3 times instead of 1.
export const getOwnerId = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('getOwnerId() called without an authenticated session.');
  }

  return user.id;
});
