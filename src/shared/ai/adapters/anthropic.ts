import 'server-only';

import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

import type { AiService, StructuredCallOptions } from '../types';

export function createAnthropicAdapter(): AiService {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
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

      const toolUse = response.content.find(
        (block) => block.type === 'tool_use',
      );
      if (!toolUse) {
        throw new Error('Anthropic response did not include structured output');
      }

      return schema.parse(toolUse.input);
    },
  };
}
