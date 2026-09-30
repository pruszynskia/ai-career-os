import 'server-only';

import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

import { AiOutputError } from '../errors';
import type { AiService, StructuredCallOptions } from '../types';

export function createAnthropicAdapter(): AiService {
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    // Vercel kills the function around ~90-300s depending on plan; a 10min
    // SDK default plus its own retries means the platform cuts the request
    // before the SDK gives up, so the caller never sees an error to fall
    // back on (AI-7). One retry, shorter than the function's own budget.
    timeout: 90_000,
    maxRetries: 1,
  });
  const model = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-5';

  return {
    async generateStructured<Schema extends z.ZodObject>({
      messages,
      schema,
      schemaName,
      maxTokens = 1024,
    }: StructuredCallOptions<Schema>): Promise<z.infer<Schema>> {
      const system = messages.find(
        (message) => message.role === 'system',
      )?.content;
      const userMessages = messages.filter(
        (message) => message.role === 'user',
      );

      const response = await client.messages.create({
        model,
        max_tokens: maxTokens,
        system,
        messages: userMessages.map((message) => ({
          role: 'user' as const,
          content: message.content,
        })),
        tools: [
          {
            name: schemaName,
            input_schema: z.toJSONSchema(schema) as Anthropic.Tool.InputSchema,
          },
        ],
        tool_choice: { type: 'tool', name: schemaName },
      });

      if (response.stop_reason === 'max_tokens') {
        throw new AiOutputError(
          'Anthropic response was truncated (max_tokens); raise maxTokens',
        );
      }

      const toolUse = response.content.find(
        (block) => block.type === 'tool_use',
      );
      if (!toolUse) {
        throw new AiOutputError(
          'Anthropic response did not include structured output',
        );
      }

      const parsed = schema.safeParse(toolUse.input);
      if (!parsed.success) {
        throw new AiOutputError('Anthropic response failed schema validation', {
          cause: parsed.error,
        });
      }
      return parsed.data;
    },
  };
}
