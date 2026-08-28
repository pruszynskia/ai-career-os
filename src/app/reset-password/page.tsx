import { redirect } from 'next/navigation';

import { updatePassword } from '@/shared/auth/actions';
import { createClient } from '@/shared/db/client';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
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
          <h1 className="text-2xl font-semibold">Set a new password</h1>
        </CardHeader>
        <CardContent>
          <form action={updatePassword} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium">
                New password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="New password"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm new password
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>
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
