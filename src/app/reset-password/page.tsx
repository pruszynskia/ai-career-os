import { redirect } from 'next/navigation';

import { updatePassword } from '@/shared/auth/actions';
import { AUTH_ERROR_MESSAGES } from '@/shared/auth/auth-error';
import { createClient } from '@/shared/db/client';
import { Banner } from '@/shared/ui/banner';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { Field } from '@/shared/ui/field';
import { Heading } from '@/shared/ui/primitives';
import { Input } from '@/shared/ui/input';
import { SubmitButton } from '@/shared/ui/submit-button';

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const isMismatch = error === 'mismatch';

  // The recovery link signs the user in via /auth/callback. No session here
  // means the link was missing, expired, or already used — send them back to
  // request a fresh one instead of rendering a form that can only fail.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/forgot-password?error=expired');
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-7 p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <Heading level={3} as="h1">
            Set a new password
          </Heading>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {error && !isMismatch && (
            <Banner tone="danger">
              {AUTH_ERROR_MESSAGES[error] ??
                'Could not update password. Request a new reset link.'}
            </Banner>
          )}
          <form action={updatePassword} className="flex flex-col gap-4">
            <Field id="password" label="New password">
              <Input
                name="password"
                type="password"
                placeholder="New password"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </Field>
            <Field
              id="confirmPassword"
              label="Confirm new password"
              error={isMismatch ? 'Passwords do not match.' : undefined}
            >
              <Input
                name="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                autoComplete="new-password"
                minLength={8}
                required
                aria-invalid={isMismatch}
              />
            </Field>
            <SubmitButton size="lg" className="mt-1 w-full">
              Update password
            </SubmitButton>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
