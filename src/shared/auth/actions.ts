'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { authErrorKey, MIN_PASSWORD_LENGTH } from '@/shared/auth/auth-error';
import { createClient } from '@/shared/db/client';
import { isPasswordBreached } from '@/shared/auth/pwned-password';
import { guardAuthRateLimit } from '@/shared/rate-limit/auth-guard';

// A missing or non-text field must read as empty (and fail validation), not
// throw a 500.
function field(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === 'string' ? value : '';
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/sign-in');
}

// Base URL for the absolute redirect links Supabase embeds in confirmation
// and recovery emails. Prefer the configured site URL so a poisoned Host
// header can't redirect reset tokens to an attacker; fall back to request
// headers only for local dev where the env var is unset.
async function siteOrigin() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  // Vercel preview deployments: VERCEL_URL is set by the platform, not the
  // request, so it's safe where NEXT_PUBLIC_SITE_URL (production-only) isn't.
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  // Request headers are attacker-controlled; never build emailed links from
  // them in a production build.
  if (process.env.NODE_ENV === 'production') {
    throw new Error('NEXT_PUBLIC_SITE_URL must be set in production.');
  }
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  return h.get('origin') ?? (host ? `http://${host}` : 'http://localhost:3000');
}

export async function signUp(formData: FormData) {
  await guardAuthRateLimit('/sign-up');
  const password = field(formData, 'password');
  // Supabase's own minimum is lower (config.toml), so the form's minLength
  // is only enforced if we check it here too.
  if (password.length < MIN_PASSWORD_LENGTH) {
    redirect('/sign-up?error=short_password');
  }
  if (await isPasswordBreached(password)) {
    redirect('/sign-up?error=breached_password');
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: field(formData, 'email'),
    password,
    options: { emailRedirectTo: `${await siteOrigin()}/auth/callback` },
  });

  if (error) {
    console.error('[auth] signUp failed', error.code, error.message);
    redirect(`/sign-up?error=${authErrorKey(error)}`);
  }

  // With email confirmation off, signUp returns a live session and the
  // cookies are already set — there is no email to wait for.
  if (data.session) {
    redirect('/onboarding');
  }

  redirect('/sign-up?sent=1');
}

export async function signInWithGoogle() {
  await guardAuthRateLimit('/sign-in');
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${await siteOrigin()}/auth/callback` },
  });

  if (error || !data.url) {
    redirect('/sign-in?error=oauth');
  }

  redirect(data.url);
}

export async function requestPasswordReset(formData: FormData) {
  await guardAuthRateLimit('/forgot-password');
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(
    field(formData, 'email'),
    { redirectTo: `${await siteOrigin()}/auth/callback` },
  );

  if (error) {
    console.error(
      '[auth] resetPasswordForEmail failed',
      error.code,
      error.message,
    );
    // A rate limit is project-wide, so surfacing it discloses nothing about
    // whether this email has an account.
    if (authErrorKey(error) === 'rate_limit') {
      redirect('/forgot-password?error=rate_limit');
    }
  }

  // Otherwise always report success — never disclose whether an account exists.
  redirect('/forgot-password?sent=1');
}

export async function updatePassword(formData: FormData) {
  const password = field(formData, 'password');
  const confirmPassword = field(formData, 'confirmPassword');

  if (password !== confirmPassword) {
    redirect('/reset-password?error=mismatch');
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    redirect('/reset-password?error=short_password');
  }
  if (await isPasswordBreached(password)) {
    redirect('/reset-password?error=breached_password');
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    console.error('[auth] updateUser failed', error.code, error.message);
    redirect(`/reset-password?error=${authErrorKey(error)}`);
  }

  redirect('/dashboard');
}
