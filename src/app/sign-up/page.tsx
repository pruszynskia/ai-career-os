import Link from 'next/link';

import { signInWithGoogle, signUp } from '@/shared/auth/actions';
import { AUTH_ERROR_MESSAGES } from '@/shared/auth/auth-error';
import { Banner } from '@/shared/ui/banner';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { Field } from '@/shared/ui/field';
import { Input } from '@/shared/ui/input';
import { Divider, Heading } from '@/shared/ui/primitives';
import { SubmitButton } from '@/shared/ui/submit-button';

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const { error, sent } = await searchParams;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-7 p-6 max-md:p-4">
      <Link href="/" className="text-sm font-semibold tracking-tight">
        Career OS
      </Link>
      <Card className="w-full max-w-sm max-md:max-w-none max-md:rounded-none max-md:border-none">
        <CardHeader>
          <Heading level={3} as="h1">
            Create account
          </Heading>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {sent && (
            <Banner tone="success">
              Check your email for a confirmation link. If this email already
              has an account, sign in instead.
            </Banner>
          )}
          {error && (
            <Banner tone="danger">
              {AUTH_ERROR_MESSAGES[error] ??
                'Could not create account. Please try again.'}
            </Banner>
          )}
          <form action={signUp} className="flex flex-col gap-4">
            <Field id="email" label="Email">
              <Input name="email" type="email" placeholder="Email" required />
            </Field>
            <Field id="password" label="Password" help="At least 8 characters.">
              <Input
                name="password"
                type="password"
                placeholder="Password"
                minLength={8}
                required
              />
            </Field>
            <SubmitButton size="lg" className="mt-1 w-full">
              Sign up
            </SubmitButton>
          </form>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <Divider className="flex-1" />
            or
            <Divider className="flex-1" />
          </div>
          <form action={signInWithGoogle}>
            <SubmitButton variant="secondary" size="lg" className="w-full">
              Continue with Google
            </SubmitButton>
          </form>
        </CardContent>
      </Card>
      <p className="text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/sign-in" className="font-medium text-foreground underline">
          Sign in
        </Link>
      </p>
    </main>
  );
}
