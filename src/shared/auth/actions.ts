'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { createClient } from '@/shared/db/client';

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
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: { emailRedirectTo: `${await siteOrigin()}/auth/callback` },
  });

  if (error) {
    redirect('/sign-up?error=1');
  }

  redirect('/sign-up?sent=1');
}

export async function requestPasswordReset(formData: FormData) {
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(formData.get('email') as string, {
    redirectTo: `${await siteOrigin()}/auth/callback`,
  });

  // Always report success — never disclose whether an account exists.
  redirect('/forgot-password?sent=1');
}

export async function updatePassword(formData: FormData) {
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (password !== confirmPassword) {
    redirect('/reset-password?error=mismatch');
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect('/reset-password?error=1');
  }

  redirect('/dashboard');
}
