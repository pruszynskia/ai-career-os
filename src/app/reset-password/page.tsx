import { redirect } from 'next/navigation';

import { updatePassword } from '@/shared/auth/actions';
import { createClient } from '@/shared/db/client';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { Field } from '@/shared/ui/field';
import { Heading } from '@/shared/ui/primitives';
import { Input } from '@/shared/ui/input';

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

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
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <Heading level={4} as="h1" className="font-medium">
            Set a new password
          </Heading>
        </CardHeader>
        <CardContent>
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
            <Field id="confirmPassword" label="Confirm new password">
              <Input
                name="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </Field>
            <Button type="submit" className="mt-1">
              Update password
            </Button>
          </form>
          {error && (
            <p role="alert" className="mt-4 text-sm text-destructive">
              {error === 'mismatch'
                ? 'Passwords do not match.'
                : 'Could not update password. Request a new reset link.'}
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
