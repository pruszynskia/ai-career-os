import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import WebSocket from 'ws';

// Created per-request (not a singleton) so it carries the current request's
// cookies — see @supabase/ssr's Next.js App Router pattern.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_STORAGE_SUPABASE_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_STORAGE_SUPABASE_SUPABASE_ANON_KEY!,
    {
      // Node 20 (the Node.js runtime this code executes under, not Edge) has
      // no native WebSocket; supabase-js always constructs a RealtimeClient
      // even though this app never uses realtime features.
      realtime: { transport: WebSocket as never },
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component render, which can't set cookies.
            // Safe to ignore as long as middleware refreshes the session.
          }
        },
      },
    },
  );
}
