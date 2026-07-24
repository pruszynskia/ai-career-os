import 'server-only';
import { createClient } from '@/shared/db/client';

// Single-user MVP (ADR-003/ADR-009): the one Supabase Auth user is the owner.
// Middleware already redirects unauthenticated requests to /sign-in, so any
// route handler, server action or page reaching this has a session.
export async function getOwnerId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('getOwnerId() called without an authenticated session.');
  }

  return user.id;
}
