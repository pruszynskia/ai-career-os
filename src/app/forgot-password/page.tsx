import Link from 'next/link';

import { requestPasswordReset } from '@/shared/auth/actions';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const { sent, error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <h1 className="text-2xl font-semibold">Reset password</h1>
        </CardHeader>
        <CardContent>
          {error === 'expired' && (
            <p role="alert" className="mb-4 text-sm text-destructive">
              That link has expired or was already used. Request a new one
              below.
            </p>
          )}
          <form action={requestPasswordReset} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Email"
                required
              />
            </div>
            <Button type="submit" className="mt-1">
              Send reset link
            </Button>
          </form>
          {sent && (
            <p role="status" className="mt-4 text-sm text-muted-foreground">
              If that email has an account, a reset link is on its way.
            </p>
          )}
          <p className="mt-4 text-sm text-muted-foreground">
            <Link href="/sign-in" className="underline">
              Back to sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
