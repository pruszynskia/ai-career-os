import 'server-only';

import { createAnthropicAdapter } from './adapters/anthropic';
import { createOpenAiAdapter } from './adapters/openai';
import type { AiService } from './types';

export function getAiService(): AiService {
  const provider = process.env.AI_PROVIDER ?? 'anthropic';

  if (provider === 'openai') {
    return createOpenAiAdapter();
  }

  if (provider === 'anthropic') {
    return createAnthropicAdapter();
  }

  throw new Error(`Unknown AI_PROVIDER: ${provider}`);
}
