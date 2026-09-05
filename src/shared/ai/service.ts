import 'server-only';

import { createAnthropicAdapter } from './adapters/anthropic';
import { createGeminiAdapter } from './adapters/gemini';
import { createOpenAiAdapter } from './adapters/openai';
import type { AiService } from './types';
import {
  aiUsageService,
  startOfCurrentMonth,
} from '@/entities/ai-usage/service';
import { getOwnerId } from '@/shared/auth/session';
import {
  assertWithinLimit,
  getPlanForOwner,
} from '@/shared/billing/entitlements';

const REQUIRED_KEY_BY_PROVIDER = {
  anthropic: 'ANTHROPIC_API_KEY',
  openai: 'OPENAI_API_KEY',
  gemini: 'GEMINI_API_KEY',
} as const;

export function getAiService(): AiService {
  const provider = process.env.AI_PROVIDER ?? 'anthropic';

  if (
    provider !== 'openai' &&
    provider !== 'gemini' &&
    provider !== 'anthropic'
  ) {
    throw new Error(`Unknown AI_PROVIDER: ${provider}`);
  }

  const requiredKey = REQUIRED_KEY_BY_PROVIDER[provider];
  if (!process.env[requiredKey]) {
    throw new Error(
      `Missing ${requiredKey} environment variable for AI_PROVIDER="${provider}"`,
    );
  }

  if (provider === 'openai') {
    return createOpenAiAdapter();
  }

  if (provider === 'gemini') {
    return createGeminiAdapter();
  }

  return createAnthropicAdapter();
}

// Metered entry point every feature service calls instead of getAiService()
// directly (TASK-059). Resolves the caller's owner, asserts they're within
// their plan's monthly AI-action allowance (throwing EntitlementError via
// assertWithinLimit if not - construction of the actual provider never
// happens for an over-quota call), then records one ai_usage row per
// successful generateStructured call. getAiService() itself stays the
// plain, unmetered provider factory.
export async function getMeteredAiService(action: string): Promise<AiService> {
  const ownerId = await getOwnerId();
  const plan = await getPlanForOwner(ownerId);
  const used = await aiUsageService.countForOwnerSince(
    ownerId,
    startOfCurrentMonth(),
  );
  assertWithinLimit(used, plan);

  const service = getAiService();

  return {
    async generateStructured(options) {
      const result = await service.generateStructured(options);
      await aiUsageService.record({ ownerId, action });
      return result;
    },
  };
}
