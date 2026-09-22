import type { z } from 'zod';

// Every adapter src/shared/ai/service.ts can build, including the free-tier
// Groq adapter added for TASK-089's fallback chain. The runtime array lets
// src/shared/env.ts validate AI_PROVIDER against the same set instead of
// duplicating it.
export const AI_PROVIDER_IDS = [
  'anthropic',
  'openai',
  'gemini',
  'groq',
] as const;
export type AiProviderId = (typeof AI_PROVIDER_IDS)[number];

export type AiRole = 'system' | 'user';

export interface AiMessage {
  role: AiRole;
  content: string;
}

export interface StructuredCallOptions<Schema extends z.ZodObject> {
  messages: AiMessage[];
  schema: Schema;
  schemaName: string;
  maxTokens?: number;
}

export interface AiService {
  generateStructured<Schema extends z.ZodObject>(
    options: StructuredCallOptions<Schema>,
  ): Promise<z.infer<Schema>>;
}
