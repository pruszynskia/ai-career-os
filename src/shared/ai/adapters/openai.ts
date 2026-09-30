import 'server-only';

import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import type { z } from 'zod';

import { AiOutputError } from '../errors';
import type { AiService, StructuredCallOptions } from '../types';

export function createOpenAiAdapter(): AiService {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 90_000,
    maxRetries: 1,
  });
  const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';

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

      if (completion.choices[0]?.finish_reason === 'length') {
        throw new AiOutputError(
          'OpenAI response was truncated (length); raise maxTokens',
        );
      }

      const parsed = completion.choices[0]?.message.parsed;
      if (!parsed) {
        throw new AiOutputError(
          'OpenAI response did not include structured output',
        );
      }

      const result = schema.safeParse(parsed);
      if (!result.success) {
        throw new AiOutputError('OpenAI response failed schema validation', {
          cause: result.error,
        });
      }
      return result.data;
    },
  };
}
