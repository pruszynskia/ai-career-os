// Maps a Supabase AuthError to the `?error=` key the auth pages render.
// Kept out of actions.ts because a 'use server' module may only export async
// functions. Unknown codes fall through to '1' — each page's generic banner.

export const MIN_PASSWORD_LENGTH = 8;

const CODE_TO_KEY: Record<string, string> = {
  over_email_send_rate_limit: 'rate_limit',
  over_request_rate_limit: 'rate_limit',
  weak_password: 'weak_password',
  email_address_invalid: 'invalid_email',
  user_already_exists: 'exists',
  email_exists: 'exists',
  email_not_confirmed: 'unconfirmed',
  same_password: 'same_password',
};

export function authErrorKey(error: { code?: string; status?: number }) {
  if (error.code && CODE_TO_KEY[error.code]) return CODE_TO_KEY[error.code];
  return error.status === 429 ? 'rate_limit' : '1';
}

export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  rate_limit: 'Too many attempts. Please wait a minute and try again.',
  weak_password:
    'That password is too weak. Use at least 8 characters and avoid common passwords.',
  short_password: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
  invalid_email: 'That email address is not valid.',
  exists: 'An account with this email already exists. Sign in instead.',
  unconfirmed:
    'Confirm your email first — check your inbox for the confirmation link.',
  same_password: 'Your new password must be different from the old one.',
};
