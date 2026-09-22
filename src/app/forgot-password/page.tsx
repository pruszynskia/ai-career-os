import Link from 'next/link';

import { requestPasswordReset } from '@/shared/auth/actions';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { Field } from '@/shared/ui/field';
import { Heading } from '@/shared/ui/primitives';
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
          <Heading level={4} as="h1" className="font-medium">
            Reset password
          </Heading>
        </CardHeader>
        <CardContent>
          {error === 'expired' && (
            <p role="alert" className="mb-4 text-sm text-destructive">
              That link has expired or was already used. Request a new one
              below.
            </p>
          )}
          {error === 'rate_limit' && (
            <p role="alert" className="mb-4 text-sm text-destructive">
              Too many attempts. Please wait a minute and try again.
            </p>
          )}
          <form action={requestPasswordReset} className="flex flex-col gap-4">
            <Field id="email" label="Email">
              <Input name="email" type="email" placeholder="Email" required />
            </Field>
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
