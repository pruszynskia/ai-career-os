import { NextResponse, type NextRequest } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';

import { createClient } from '@/shared/db/client';

// Accepts only same-origin absolute paths; anything that could escape the
// origin (`https://evil.com`, `//evil.com`, `/\evil.com`) falls back to
// /dashboard. Exported for direct unit testing.
export function safeNextPath(raw: string | null): string {
  return raw && /^\/(?!\/|\\)/.test(raw) ? raw : '/dashboard';
}

// Completes email confirmation and password-reset links. Two shapes:
//   token_hash + type  → stateless verifyOtp (works cross-device; used by the
//                         Supabase email templates)
//   code               → PKCE exchangeCodeForSession (kept for OAuth, TASK-054)
// then forwards to `next` (/reset-password for recovery, /dashboard otherwise).
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const code = searchParams.get('code');
  const next = safeNextPath(
    searchParams.get('next') ??
      (type === 'recovery' ? '/reset-password' : '/dashboard'),
  );

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
  } else if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  const failure =
    type === 'recovery'
      ? '/forgot-password?error=expired'
      : '/sign-in?error=link';
  return NextResponse.redirect(new URL(failure, origin));
}
