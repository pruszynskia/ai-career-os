import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';

// Service-role client — bypasses RLS. Only for scripts/create-owner-user.ts.
// Never import this into request-handling code (route handlers, services).
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
      // Node 20 has no native WebSocket; supabase-js always constructs a
      // RealtimeClient even though this app never uses realtime features.
      realtime: { transport: WebSocket as never },
    },
  );
}
