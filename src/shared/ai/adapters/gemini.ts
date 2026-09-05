import 'server-only';

import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';

import type { AiService, StructuredCallOptions } from '../types';

export function createGeminiAdapter(): AiService {
  const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const model = process.env.GEMINI_MODEL ?? 'gemini-3.6-flash';

  return {
    async generateStructured<Schema extends z.ZodObject>({
      messages,
      schema,
      schemaName,
      // Gemini 2.5 models are "thinking" models that spend output tokens on
      // hidden reasoning before the answer. A 1024 budget gets eaten by
      // thinking and truncates the JSON (finishReason MAX_TOKENS), so give a
      // larger floor that fits both the reasoning and the structured output.
      maxTokens = 8192,
    }: StructuredCallOptions<Schema>): Promise<z.infer<Schema>> {
      const system = messages.find(
        (message) => message.role === 'system',
      )?.content;
      const userText = messages
        .filter((message) => message.role === 'user')
        .map((message) => message.content)
        .join('\n\n');

      const response = await client.models.generateContent({
        model,
        contents: `${userText}\n\nRespond with only JSON matching this schema, named "${schemaName}":\n${JSON.stringify(z.toJSONSchema(schema))}`,
        config: {
          systemInstruction: system,
          responseMimeType: 'application/json',
          maxOutputTokens: maxTokens,
        },
      });

      const text = response.text;
      if (response.candidates?.[0]?.finishReason === 'MAX_TOKENS') {
        throw new Error(
          'Gemini response was truncated (MAX_TOKENS); raise maxTokens',
        );
      }
      if (!text) {
        throw new Error('Gemini response did not include structured output');
      }

      return schema.parse(JSON.parse(text));
    },
  };
}
