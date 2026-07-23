import { signIn } from '@/shared/auth/config';

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  async function authenticate(formData: FormData) {
    'use server';
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirectTo: '/',
    });
  }

  return (
    <main>
      <h1>Sign in</h1>
      <form action={authenticate}>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" placeholder="Email" required />
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" placeholder="Password" required />
        <button type="submit">Sign in</button>
      </form>
      {error && <p>Invalid email or password.</p>}
    </main>
  );
}
