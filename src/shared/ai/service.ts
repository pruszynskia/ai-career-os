import 'server-only';

import { createAnthropicAdapter } from './adapters/anthropic';
import { createGeminiAdapter } from './adapters/gemini';
import { createOpenAiAdapter } from './adapters/openai';
import type { AiService } from './types';

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
