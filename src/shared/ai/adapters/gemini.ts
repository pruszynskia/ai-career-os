import 'server-only';

import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';

import { AiOutputError, isRetryableAiError } from '../errors';
import type { AiService, StructuredCallOptions } from '../types';

// GEMINI_MODEL is an ordered, comma-separated list: a retryable failure
// (429/5xx "high demand", timeout, unusable output) on one model moves to
// the next before the provider as a whole counts as failed.
const DEFAULT_MODELS = 'gemini-3.6-flash,gemini-3.5-flash';

export function createGeminiAdapter(): AiService {
  const client = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    // No retryOptions: once exhausted, the SDK rethrows a plain Error with no
    // `status`, which hides 429/503 from isRetryableAiError and the fallback
    // chain. Without it, ApiError keeps `status`.
    httpOptions: { timeout: 90_000 },
  });
  const models = (process.env.GEMINI_MODEL || DEFAULT_MODELS)
    .split(',')
    .map((model) => model.trim())
    .filter(Boolean);

  async function generateWith<Schema extends z.ZodObject>(
    model: string,
    {
      messages,
      schema,
      schemaName,
      // Gemini 2.5 models are "thinking" models that spend output tokens on
      // hidden reasoning before the answer. A 1024 budget gets eaten by
      // thinking and truncates the JSON (finishReason MAX_TOKENS), so give a
      // larger floor that fits both the reasoning and the structured output.
      maxTokens = 8192,
    }: StructuredCallOptions<Schema>,
  ): Promise<z.infer<Schema>> {
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
      throw new AiOutputError(
        'Gemini response was truncated (MAX_TOKENS); raise maxTokens',
      );
    }
    if (!text) {
      throw new AiOutputError(
        'Gemini response did not include structured output',
      );
    }

    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch (cause) {
      throw new AiOutputError('Gemini response was not valid JSON', {
        cause,
      });
    }

    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      throw new AiOutputError('Gemini response failed schema validation', {
        cause: parsed.error,
      });
    }
    return parsed.data;
  }

  return {
    async generateStructured(options) {
      let lastError: unknown;
      for (const model of models) {
        try {
          return await generateWith(model, options);
        } catch (error) {
          if (!isRetryableAiError(error)) throw error;
          lastError = error;
        }
      }
      throw lastError;
    },
  };
}
