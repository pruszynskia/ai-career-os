import { redirect } from 'next/navigation';

import { createClient } from '@/shared/db/client';

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  async function authenticate(formData: FormData) {
    'use server';
    const supabase = await createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    });

    if (signInError) {
      redirect('/sign-in?error=1');
    }

    redirect('/');
  }

  return (
    <main>
      <h1>Sign in</h1>
      <form action={authenticate}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Email"
          required
        />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Password"
          required
        />
        <button type="submit">Sign in</button>
      </form>
      {error && <p>Invalid email or password.</p>}
    </main>
  );
}
