import 'server-only';

import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import type { z } from 'zod';

import type { AiService, StructuredCallOptions } from '../types';

// Groq's API is OpenAI-compatible (https://console.groq.com/docs/openai), so
// this reuses the already-installed openai package pointed at Groq's base
// URL instead of adding a second SDK dependency (TASK-089). Groq is the
// default first entry in AI_FREE_PROVIDERS - the only adapters with a real
// ongoing free tier are this one and Gemini.
export function createGroqAdapter(): AiService {
  const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
  });
  // Groq's structured-output (json_schema) response format is only
  // supported on a subset of its models (gpt-oss, kimi-k2, llama-4) - a
  // model outside that list 400s on every zodResponseFormat call, which is
  // non-retryable and breaks the free chain by default. See
  // https://console.groq.com/docs/structured-outputs.
  const model =
    process.env.GROQ_MODEL ?? 'meta-llama/llama-4-scout-17b-16e-instruct';

  return {
    async generateStructured<Schema extends z.ZodObject>({
      messages,
      schema,
      schemaName,
      maxTokens = 1024,
    }: StructuredCallOptions<Schema>): Promise<z.infer<Schema>> {
      const completion = await client.chat.completions.parse({
        model,
        max_completion_tokens: maxTokens,
        messages: messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
        response_format: zodResponseFormat(schema, schemaName),
      });

      const parsed = completion.choices[0]?.message.parsed;
      if (!parsed) {
        throw new Error('Groq response did not include structured output');
      }

      return schema.parse(parsed);
    },
  };
}
