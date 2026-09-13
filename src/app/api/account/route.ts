import { NextResponse } from 'next/server';
import { z } from 'zod';

import { deleteOwnAccount } from '@/features/account/services/delete-account.service';
import { getOwnerId } from '@/shared/auth/session';
import { enforceRateLimit } from '@/shared/rate-limit';

// Requires the literal string "DELETE" in the body rather than a bare
// boolean, so a confused client can't trigger this by accident.
const deleteAccountSchema = z.object({ confirm: z.literal('DELETE') });

export async function DELETE(request: Request) {
  const body = await request.json().catch(() => null);
  const parsedInput = deleteAccountSchema.safeParse(body);

  if (!parsedInput.success) {
    return NextResponse.json(
      { message: 'Type DELETE to confirm account deletion.' },
      { status: 400 },
    );
  }

  const ownerId = await getOwnerId();

  // Reuses the 'auth' bucket (see src/shared/rate-limit): this is a rare,
  // sensitive, signed-in action, the same shape as a sign-in attempt.
  const { ok, retryAfter } = await enforceRateLimit('auth', ownerId);
  if (!ok) {
    return NextResponse.json(
      { message: 'Too many attempts. Please wait a minute and try again.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    );
  }

  try {
    await deleteOwnAccount();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to delete the account', error);
    return NextResponse.json(
      { message: 'Failed to delete the account.' },
      { status: 500 },
    );
  }
}
