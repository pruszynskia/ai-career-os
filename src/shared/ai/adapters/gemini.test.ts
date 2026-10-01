import { ApiError } from '@google/genai';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

const generateContent = vi.fn();
vi.mock('@google/genai', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@google/genai')>()),
  GoogleGenAI: class {
    models = { generateContent };
  },
}));

const { createGeminiAdapter } = await import('./gemini');

const call = () =>
  createGeminiAdapter().generateStructured({
    messages: [{ role: 'user', content: 'hi' }],
    schema: z.object({ title: z.string() }),
    schemaName: 'test',
  });

const ok = { text: '{"title":"Dev"}', candidates: [{ finishReason: 'STOP' }] };

describe('gemini adapter model fallback', () => {
  beforeEach(() => {
    generateContent.mockReset();
    vi.stubEnv('GEMINI_MODEL', 'model-a, model-b');
  });

  it('moves to the next model when one is overloaded (503)', async () => {
    generateContent
      .mockRejectedValueOnce(new ApiError({ message: 'busy', status: 503 }))
      .mockResolvedValueOnce(ok);

    await expect(call()).resolves.toEqual({ title: 'Dev' });
    expect(generateContent.mock.calls.map(([req]) => req.model)).toEqual([
      'model-a',
      'model-b',
    ]);
  });

  it('rethrows the last error with its status when every model fails', async () => {
    generateContent.mockRejectedValue(
      new ApiError({ message: 'busy', status: 503 }),
    );

    await expect(call()).rejects.toMatchObject({ status: 503 });
    expect(generateContent).toHaveBeenCalledTimes(2);
  });

  it('does not try the next model on a non-retryable error (400)', async () => {
    generateContent.mockRejectedValueOnce(
      new ApiError({ message: 'bad request', status: 400 }),
    );

    await expect(call()).rejects.toMatchObject({ status: 400 });
    expect(generateContent).toHaveBeenCalledTimes(1);
  });
});
