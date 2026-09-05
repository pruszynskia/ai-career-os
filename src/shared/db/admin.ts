import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';

// Service-role client — bypasses RLS. Only for scripts/create-owner-user.ts
// and the Stripe webhook path (see ADR-015): a signature-verified webhook
// has no user session and therefore no auth.uid() for RLS to match. Do not
// import this into any other request-handling code.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_STORAGE_SUPABASE_SUPABASE_URL!,
    process.env.STORAGE_SUPABASE_SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
      // Node 20 has no native WebSocket; supabase-js always constructs a
      // RealtimeClient even though this app never uses realtime features.
      realtime: { transport: WebSocket as never },
    },
  );
}
