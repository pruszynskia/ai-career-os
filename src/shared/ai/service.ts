import 'server-only';

import type { z } from 'zod';

import { createAnthropicAdapter } from './adapters/anthropic';
import { createGeminiAdapter } from './adapters/gemini';
import { createGroqAdapter } from './adapters/groq';
import { createOpenAiAdapter } from './adapters/openai';
import { isRetryableAiError } from './errors';
import type { AiProviderId, AiService, StructuredCallOptions } from './types';
import {
  aiUsageService,
  startOfCurrentMonth,
} from '@/entities/ai-usage/service';
import { getOwnerId } from '@/shared/auth/session';
import {
  assertWithinLimit,
  getPlanForOwner,
} from '@/shared/billing/entitlements';
import type { Plan } from '@/shared/billing/plans';
import { isProviderInCooldown, setProviderCooldown } from '@/shared/rate-limit';

const REQUIRED_KEY_BY_PROVIDER: Record<AiProviderId, string> = {
  anthropic: 'ANTHROPIC_API_KEY',
  openai: 'OPENAI_API_KEY',
  gemini: 'GEMINI_API_KEY',
  groq: 'GROQ_API_KEY',
};

const ADAPTER_FACTORY_BY_PROVIDER: Record<AiProviderId, () => AiService> = {
  anthropic: createAnthropicAdapter,
  openai: createOpenAiAdapter,
  gemini: createGeminiAdapter,
  groq: createGroqAdapter,
};

function isAiProviderId(value: string): value is AiProviderId {
  return value in REQUIRED_KEY_BY_PROVIDER;
}

function isProviderConfigured(provider: AiProviderId): boolean {
  return Boolean(process.env[REQUIRED_KEY_BY_PROVIDER[provider]]);
}

function buildProvider(provider: AiProviderId): AiService {
  const requiredKey = REQUIRED_KEY_BY_PROVIDER[provider];
  if (!process.env[requiredKey]) {
    throw new Error(
      `Missing ${requiredKey} environment variable for AI provider "${provider}"`,
    );
  }
  return ADAPTER_FACTORY_BY_PROVIDER[provider]();
}

function resolveConfiguredProvider(): AiProviderId {
  const provider = process.env.AI_PROVIDER ?? 'anthropic';
  if (!isAiProviderId(provider)) {
    throw new Error(`Unknown AI_PROVIDER: ${provider}`);
  }
  return provider;
}

export function getAiService(): AiService {
  return buildProvider(resolveConfiguredProvider());
}

// The ordered provider list for `plan`, read from AI_FREE_PROVIDERS /
// AI_PAID_PROVIDERS (comma-separated) - never both, so a free-plan owner's
// request can never reach a paid-only provider. Null means the fallback
// vars aren't configured for this plan, and callWithFallback keeps today's
// single-AI_PROVIDER behavior unchanged.
const DEFAULT_PROVIDERS_BY_PLAN: Record<'free' | 'paid', AiProviderId[]> = {
  free: ['groq', 'gemini'],
  paid: ['anthropic', 'openai'],
};

// Providers a free-plan owner may ever be routed to, even via a custom
// AI_FREE_PROVIDERS override - keeps the "never reach a paid-only provider"
// guarantee structural instead of trusting the operator's env value.
const FREE_ELIGIBLE_PROVIDERS: ReadonlySet<AiProviderId> = new Set(
  DEFAULT_PROVIDERS_BY_PLAN.free,
);

function resolveProviderList(plan: Plan): AiProviderId[] | null {
  // Legacy single-AI_PROVIDER behavior only applies when neither var is
  // set at all. If either one is configured, the fallback system is in
  // use - a free-plan owner must get the free default list rather than
  // silently falling through to AI_PROVIDER, which can be a paid provider.
  if (!process.env.AI_FREE_PROVIDERS && !process.env.AI_PAID_PROVIDERS) {
    return null;
  }

  const isFree = plan.id === 'free';
  const envVarName = isFree ? 'AI_FREE_PROVIDERS' : 'AI_PAID_PROVIDERS';
  const envValue = process.env[envVarName];
  if (!envValue) {
    return DEFAULT_PROVIDERS_BY_PLAN[isFree ? 'free' : 'paid'];
  }

  const providers = envValue
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
  const invalid = providers.find((entry) => !isAiProviderId(entry));
  if (invalid) {
    throw new Error(`Unknown provider "${invalid}" in ${envVarName}`);
  }
  if (isFree) {
    const paidOnly = providers.find(
      (entry) => !FREE_ELIGIBLE_PROVIDERS.has(entry as AiProviderId),
    );
    if (paidOnly) {
      throw new Error(
        `Paid-only provider "${paidOnly}" in ${envVarName} - a free-plan owner must never be routed to it`,
      );
    }
  }
  return providers as AiProviderId[];
}

async function callWithFallback<Schema extends z.ZodObject>(
  plan: Plan,
  options: StructuredCallOptions<Schema>,
): Promise<{ result: z.infer<Schema>; provider: AiProviderId }> {
  const providers = resolveProviderList(plan);

  if (!providers) {
    const provider = resolveConfiguredProvider();
    const result = await buildProvider(provider).generateStructured(options);
    return { result, provider };
  }

  let lastError: unknown;
  let anyConfigured = false;
  for (const provider of providers) {
    // An unconfigured provider (no API key) in the list is skipped, not
    // fatal - the chain should still reach the next configured provider.
    if (!isProviderConfigured(provider)) continue;
    anyConfigured = true;
    if (await isProviderInCooldown(provider)) continue;
    try {
      const result = await buildProvider(provider).generateStructured(options);
      return { result, provider };
    } catch (error) {
      if (!isRetryableAiError(error)) throw error;
      lastError = error;
      await setProviderCooldown(provider, providerCooldownSeconds());
    }
  }

  // No provider in the chain has an API key set - a misconfiguration, not a
  // transient rate limit, so it must not surface as a 429.
  if (!anyConfigured) {
    const requiredKeys = providers.map(
      (provider) => REQUIRED_KEY_BY_PROVIDER[provider],
    );
    throw new Error(
      `No configured AI provider in fallback chain [${providers.join(', ')}] - set one of: ${requiredKeys.join(', ')}`,
    );
  }

  throw (
    lastError ??
    rateLimitError(`All providers are in cooldown: ${providers.join(', ')}`)
  );
}

function providerCooldownSeconds(): number {
  const raw = process.env.AI_PROVIDER_COOLDOWN_SECONDS;
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 60;
}

// isRateLimitError (src/shared/ai/errors.ts) keys off `status`, so
// toAiErrorResponse maps this to the same typed 429 as a provider's own
// rate-limit error, instead of a generic 500.
function rateLimitError(message: string): Error {
  return Object.assign(new Error(message), { status: 429 });
}

// Metered entry point every feature service calls instead of getAiService()
// directly (TASK-059). Resolves the caller's owner, asserts they're within
// their plan's monthly AI-action allowance (throwing EntitlementError via
// assertWithinLimit if not - construction of the actual provider never
// happens for an over-quota call), then records one ai_usage row per
// successful generateStructured call, walking the caller's plan-appropriate
// provider fallback chain (TASK-089) when one is configured.
export async function getMeteredAiService(action: string): Promise<AiService> {
  const ownerId = await getOwnerId();
  const plan = await getPlanForOwner(ownerId);
  const used = await aiUsageService.countForOwnerSince(
    ownerId,
    startOfCurrentMonth(),
  );
  assertWithinLimit(used, plan);

  return {
    async generateStructured(options) {
      const { result, provider } = await callWithFallback(plan, options);
      await aiUsageService.record({ ownerId, action, provider });
      return result;
    },
  };
}
