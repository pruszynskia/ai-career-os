import Link from 'next/link';

import { signInWithGoogle, signUp } from '@/shared/auth/actions';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { Field } from '@/shared/ui/field';
import { Input } from '@/shared/ui/input';
import { Divider, Heading } from '@/shared/ui/primitives';

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; sent?: string }>;
}) {
  const { error, sent } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <Heading level={4} as="h1" className="font-medium">
            Create account
          </Heading>
        </CardHeader>
        <CardContent>
          <form action={signUp} className="flex flex-col gap-4">
            <Field id="email" label="Email">
              <Input name="email" type="email" placeholder="Email" required />
            </Field>
            <Field id="password" label="Password">
              <Input
                name="password"
                type="password"
                placeholder="Password"
                minLength={8}
                required
              />
            </Field>
            <Button type="submit" className="mt-1">
              Sign up
            </Button>
          </form>
          <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
            <Divider className="flex-1" />
            or
            <Divider className="flex-1" />
          </div>
          <form action={signInWithGoogle}>
            <Button type="submit" variant="outline" className="w-full">
              Continue with Google
            </Button>
          </form>
          {sent && (
            <p role="status" className="mt-4 text-sm text-muted-foreground">
              Check your email for a confirmation link.
            </p>
          )}
          {error && (
            <p role="alert" className="mt-4 text-sm text-destructive">
              {error === 'rate_limit'
                ? 'Too many attempts. Please wait a minute and try again.'
                : 'Could not create account. Try a different email.'}
            </p>
          )}
          <p className="mt-4 text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/sign-in" className="underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
