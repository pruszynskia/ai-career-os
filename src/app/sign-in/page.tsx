import Link from 'next/link';
import { redirect } from 'next/navigation';

import { signInWithGoogle } from '@/shared/auth/actions';
import { AUTH_ERROR_MESSAGES, authErrorKey } from '@/shared/auth/auth-error';
import { createClient } from '@/shared/db/client';
import { guardAuthRateLimit } from '@/shared/rate-limit/auth-guard';
import { Banner } from '@/shared/ui/banner';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { Field } from '@/shared/ui/field';
import { Input } from '@/shared/ui/input';
import { Divider, Heading } from '@/shared/ui/primitives';
import { SubmitButton } from '@/shared/ui/submit-button';

const ERROR_MESSAGES: Record<string, string> = {
  ...AUTH_ERROR_MESSAGES,
  link: 'That link is invalid or has expired.',
  oauth: 'Could not sign in with Google. Please try again.',
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  async function authenticate(formData: FormData) {
    'use server';
    await guardAuthRateLimit('/sign-in');
    const supabase = await createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    });

    if (signInError) {
      // invalid_credentials (the common case) falls through to '1'.
      redirect(`/sign-in?error=${authErrorKey(signInError)}`);
    }

    redirect('/');
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-7 p-6 max-md:p-4">
      <Link href="/" className="text-sm font-semibold tracking-tight">
        Career OS
      </Link>
      <Card className="w-full max-w-sm max-md:max-w-none max-md:rounded-none max-md:border-none">
        <CardHeader>
          <Heading level={3} as="h1">
            Sign in
          </Heading>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {error && (
            <Banner tone="danger">
              {ERROR_MESSAGES[error] ?? 'Invalid email or password.'}
            </Banner>
          )}
          <form action={authenticate} className="flex flex-col gap-4">
            <Field id="email" label="Email">
              <Input name="email" type="email" placeholder="Email" required />
            </Field>
            <Field
              id="password"
              label={
                <span className="flex w-full items-center justify-between">
                  Password
                  <Link
                    href="/forgot-password"
                    className="text-xs font-normal text-muted-foreground hover:text-foreground"
                  >
                    Forgot password?
                  </Link>
                </span>
              }
            >
              <Input
                name="password"
                type="password"
                placeholder="Password"
                required
              />
            </Field>
            <SubmitButton size="lg" className="mt-1 w-full">
              Sign in
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
        Need an account?{' '}
        <Link href="/sign-up" className="font-medium text-foreground underline">
          Sign up
        </Link>
      </p>
    </main>
  );
}
