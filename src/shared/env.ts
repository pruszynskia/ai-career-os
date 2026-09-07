import { z } from 'zod';

// Central, Zod-validated environment access. Replaces bare `process.env.X!`
// assertions so a missing value is a readable refusal to start rather than an
// obscure runtime failure deep inside a request.
//
// Two schemas, because only the NEXT_PUBLIC_ Supabase pair is guaranteed at
// build time (that is all CI's build/e2e steps provide). Everything else is
// server-only and validated lazily on first use, so the build and the CI
// placeholder environment keep working.

const clientSchema = z.object({
  NEXT_PUBLIC_STORAGE_SUPABASE_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_STORAGE_SUPABASE_SUPABASE_ANON_KEY: z.string().min(1),
});

const serverSchema = z.object({
  // Supabase service role — bypasses RLS, webhook/script paths only.
  STORAGE_SUPABASE_SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  // AI provider selection and per-provider keys. Optional here because the
  // adapters still read them directly; listed so this module documents them.
  AI_PROVIDER: z.enum(['anthropic', 'openai', 'gemini']).optional(),
  ANTHROPIC_API_KEY: z.string().min(1).optional(),
  OPENAI_API_KEY: z.string().min(1).optional(),
  GEMINI_API_KEY: z.string().min(1).optional(),
  // Stripe — billing. Optional: an environment without billing configured
  // still boots; the webhook route asserts its own secret when it runs.
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  STRIPE_PRICE_ID_PRO: z.string().min(1).optional(),
  // Upstash Redis — request rate limiting for the auth actions and AI
  // endpoints. Optional: an unset pair means "not enforced" (local dev, CI).
  // src/shared/rate-limit reads these directly for a lazy per-request read and
  // logs loudly in production when they are missing.
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
});

export type ClientEnv = z.infer<typeof clientSchema>;
export type ServerEnv = z.infer<typeof serverSchema>;

/**
 * Parse `source` against `schema`, throwing a single readable message that
 * names every missing or invalid variable. Pure — exported for testing.
 */
export function parseEnv<T>(
  schema: z.ZodType<T>,
  source: Record<string, unknown> = process.env,
): T {
  const result = schema.safeParse(source);
  if (result.success) return result.data;

  const lines = result.error.issues.map(
    (issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`,
  );
  throw new Error(
    `Invalid environment variables:\n${lines.join('\n')}\n` +
      'See .env.example for the full list and which variables are server-only.',
  );
}

let clientCache: ClientEnv | undefined;
let serverCache: ServerEnv | undefined;

/** Public (NEXT_PUBLIC_) variables. Safe on the client and the server. */
export function getClientEnv(): ClientEnv {
  return (clientCache ??= parseEnv(clientSchema));
}

/** Server-only variables. Never import into client components. */
export function getServerEnv(): ServerEnv {
  return (serverCache ??= parseEnv(serverSchema));
}
