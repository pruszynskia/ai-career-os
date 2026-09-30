import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { requestPasswordReset } from '@/shared/auth/actions';
import { Banner } from '@/shared/ui/banner';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { Field } from '@/shared/ui/field';
import { Heading } from '@/shared/ui/primitives';
import { Input } from '@/shared/ui/input';
import { SubmitButton } from '@/shared/ui/submit-button';

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const { sent, error } = await searchParams;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-7 p-6 max-md:p-4">
      <Link href="/" className="text-sm font-semibold tracking-tight">
        Career OS
      </Link>
      <Card className="w-full max-w-sm max-md:max-w-none max-md:rounded-none max-md:border-none">
        <CardHeader>
          <Heading level={3} as="h1">
            Reset password
          </Heading>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {error === 'expired' && (
            <Banner tone="warning">
              That link has expired or was already used. Request a new one
              below.
            </Banner>
          )}
          {error === 'rate_limit' && (
            <Banner tone="danger">
              Too many attempts. Please wait a minute and try again.
            </Banner>
          )}
          {sent && (
            <Banner tone="success">
              If that email has an account, a reset link is on its way.
            </Banner>
          )}
          <form action={requestPasswordReset} className="flex flex-col gap-4">
            <Field id="email" label="Email">
              <Input name="email" type="email" placeholder="Email" required />
            </Field>
            <SubmitButton size="lg" className="mt-1 w-full">
              Send reset link
            </SubmitButton>
          </form>
        </CardContent>
      </Card>
      <Link
        href="/sign-in"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Back to sign in
      </Link>
    </main>
  );
}
