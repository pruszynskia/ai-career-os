'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { authErrorKey, MIN_PASSWORD_LENGTH } from '@/shared/auth/auth-error';
import { createClient } from '@/shared/db/client';
import { guardAuthRateLimit } from '@/shared/rate-limit/auth-guard';

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
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  return h.get('origin') ?? (host ? `http://${host}` : 'http://localhost:3000');
}

export async function signUp(formData: FormData) {
  await guardAuthRateLimit('/sign-up');
  const password = formData.get('password') as string;
  // Supabase's own minimum is lower (config.toml), so the form's minLength
  // is only enforced if we check it here too.
  if (password.length < MIN_PASSWORD_LENGTH) {
    redirect('/sign-up?error=short_password');
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: formData.get('email') as string,
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
    formData.get('email') as string,
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
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (password !== confirmPassword) {
    redirect('/reset-password?error=mismatch');
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    redirect('/reset-password?error=short_password');
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    console.error('[auth] updateUser failed', error.code, error.message);
    redirect(`/reset-password?error=${authErrorKey(error)}`);
  }

  redirect('/dashboard');
}
