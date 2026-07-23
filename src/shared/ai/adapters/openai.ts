import 'server-only';

import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import type { z } from 'zod';

import type { AiService, StructuredCallOptions } from '../types';

export function createOpenAiAdapter(): AiService {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
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

      const parsed = completion.choices[0]?.message.parsed;
      if (!parsed) {
        throw new Error('OpenAI response did not include structured output');
      }

      return schema.parse(parsed);
    },
  };
}
