import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('@/shared/auth/session', () => ({
  getOwnerId: vi.fn(),
}));
vi.mock('@/shared/billing/entitlements', () => ({
  getPlanForOwner: vi.fn(),
  assertWithinLimit: vi.fn(),
}));
vi.mock('@/entities/ai-usage/service', () => ({
  aiUsageService: {
    countForOwnerSince: vi.fn(),
    record: vi.fn(),
  },
  startOfCurrentMonth: vi.fn(() => new Date('2026-09-01T00:00:00Z')),
}));
const anthropicGenerate = vi.fn().mockResolvedValue({ ok: true });
const openaiGenerate = vi.fn();
const geminiGenerate = vi.fn();
const groqGenerate = vi.fn();

vi.mock('@/shared/ai/adapters/anthropic', () => ({
  createAnthropicAdapter: vi.fn(() => ({
    generateStructured: anthropicGenerate,
  })),
}));
vi.mock('@/shared/ai/adapters/gemini', () => ({
  createGeminiAdapter: vi.fn(() => ({ generateStructured: geminiGenerate })),
}));
vi.mock('@/shared/ai/adapters/openai', () => ({
  createOpenAiAdapter: vi.fn(() => ({ generateStructured: openaiGenerate })),
}));
vi.mock('@/shared/ai/adapters/groq', () => ({
  createGroqAdapter: vi.fn(() => ({ generateStructured: groqGenerate })),
}));
vi.mock('@/shared/rate-limit', () => ({
  isProviderInCooldown: vi.fn().mockResolvedValue(false),
  setProviderCooldown: vi.fn(),
}));

import { aiUsageService } from '@/entities/ai-usage/service';
import { getMeteredAiService } from '@/shared/ai/service';
import { getOwnerId } from '@/shared/auth/session';
import {
  assertWithinLimit,
  getPlanForOwner,
} from '@/shared/billing/entitlements';
import { EntitlementError } from '@/shared/billing/errors';
import { FREE_PLAN, getPlanById } from '@/shared/billing/plans';
import { isProviderInCooldown, setProviderCooldown } from '@/shared/rate-limit';

const callOptions = {
  messages: [],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: {} as any,
  schemaName: 'test',
};

beforeEach(() => {
  vi.clearAllMocks();
  anthropicGenerate.mockResolvedValue({ ok: true });
  process.env.ANTHROPIC_API_KEY = 'test-key';
  process.env.OPENAI_API_KEY = 'test-key';
  process.env.GEMINI_API_KEY = 'test-key';
  process.env.GROQ_API_KEY = 'test-key';
  delete process.env.AI_FREE_PROVIDERS;
  delete process.env.AI_PAID_PROVIDERS;
  vi.mocked(getOwnerId).mockResolvedValue('owner_1');
  vi.mocked(getPlanForOwner).mockResolvedValue(FREE_PLAN);
  vi.mocked(aiUsageService.countForOwnerSince).mockResolvedValue(0);
  vi.mocked(assertWithinLimit).mockImplementation(() => {});
  vi.mocked(isProviderInCooldown).mockResolvedValue(false);
});

describe('getMeteredAiService', () => {
  it('throws before building a provider or recording usage when over quota', async () => {
    vi.mocked(assertWithinLimit).mockImplementation(() => {
      throw new EntitlementError('over quota', { plan: 'free', limit: 10 });
    });

    await expect(getMeteredAiService('optimize_cv')).rejects.toBeInstanceOf(
      EntitlementError,
    );
    expect(aiUsageService.record).not.toHaveBeenCalled();
  });

  it('records exactly one usage row, tagged with the provider that served it, after a successful call', async () => {
    const service = await getMeteredAiService('optimize_cv');
    await service.generateStructured(callOptions);

    expect(aiUsageService.record).toHaveBeenCalledTimes(1);
    expect(aiUsageService.record).toHaveBeenCalledWith({
      ownerId: 'owner_1',
      action: 'optimize_cv',
      provider: 'anthropic',
    });
  });

  it('matches today exactly (single AI_PROVIDER, no fallback) when AI_FREE_PROVIDERS/AI_PAID_PROVIDERS are unset', async () => {
    anthropicGenerate.mockRejectedValue(
      Object.assign(new Error('rate limited'), { status: 429 }),
    );

    const service = await getMeteredAiService('optimize_cv');
    await expect(service.generateStructured(callOptions)).rejects.toThrow(
      'rate limited',
    );

    expect(groqGenerate).not.toHaveBeenCalled();
    expect(geminiGenerate).not.toHaveBeenCalled();
    expect(aiUsageService.record).not.toHaveBeenCalled();
  });

  it('a primary provider success never invokes a second provider', async () => {
    process.env.AI_FREE_PROVIDERS = 'groq,gemini';
    groqGenerate.mockResolvedValue({ ok: true });

    const service = await getMeteredAiService('optimize_cv');
    await service.generateStructured(callOptions);

    expect(groqGenerate).toHaveBeenCalledTimes(1);
    expect(geminiGenerate).not.toHaveBeenCalled();
  });

  it('falls through to the next provider on a 429, and records the one that served it', async () => {
    process.env.AI_FREE_PROVIDERS = 'groq,gemini';
    groqGenerate.mockRejectedValue(
      Object.assign(new Error('rate limited'), { status: 429 }),
    );
    geminiGenerate.mockResolvedValue({ ok: true });

    const service = await getMeteredAiService('optimize_cv');
    await service.generateStructured(callOptions);

    expect(groqGenerate).toHaveBeenCalledTimes(1);
    expect(geminiGenerate).toHaveBeenCalledTimes(1);
    expect(setProviderCooldown).toHaveBeenCalledWith('groq', 60);
    expect(aiUsageService.record).toHaveBeenCalledWith({
      ownerId: 'owner_1',
      action: 'optimize_cv',
      provider: 'gemini',
    });
  });

  it('does not fall through on a non-retryable (validation) error', async () => {
    process.env.AI_FREE_PROVIDERS = 'groq,gemini';
    groqGenerate.mockRejectedValue(
      Object.assign(new Error('bad request'), { status: 400 }),
    );

    const service = await getMeteredAiService('optimize_cv');
    await expect(service.generateStructured(callOptions)).rejects.toThrow(
      'bad request',
    );

    expect(geminiGenerate).not.toHaveBeenCalled();
    expect(setProviderCooldown).not.toHaveBeenCalled();
  });

  it('skips a provider currently in cooldown without calling it', async () => {
    process.env.AI_FREE_PROVIDERS = 'groq,gemini';
    vi.mocked(isProviderInCooldown).mockImplementation(
      async (provider) => provider === 'groq',
    );
    geminiGenerate.mockResolvedValue({ ok: true });

    const service = await getMeteredAiService('optimize_cv');
    await service.generateStructured(callOptions);

    expect(groqGenerate).not.toHaveBeenCalled();
    expect(geminiGenerate).toHaveBeenCalledTimes(1);
  });

  it('a free-plan request only ever walks AI_FREE_PROVIDERS, never AI_PAID_PROVIDERS', async () => {
    process.env.AI_FREE_PROVIDERS = 'groq';
    process.env.AI_PAID_PROVIDERS = 'anthropic';
    groqGenerate.mockRejectedValue(
      Object.assign(new Error('down'), { status: 503 }),
    );

    const service = await getMeteredAiService('optimize_cv');
    await expect(service.generateStructured(callOptions)).rejects.toThrow(
      'down',
    );

    expect(anthropicGenerate).not.toHaveBeenCalled();
  });

  it('a paid-plan request walks AI_PAID_PROVIDERS, not AI_FREE_PROVIDERS', async () => {
    vi.mocked(getPlanForOwner).mockResolvedValue(getPlanById('pro'));
    process.env.AI_FREE_PROVIDERS = 'groq';
    process.env.AI_PAID_PROVIDERS = 'anthropic';

    const service = await getMeteredAiService('optimize_cv');
    await service.generateStructured(callOptions);

    expect(groqGenerate).not.toHaveBeenCalled();
    expect(anthropicGenerate).toHaveBeenCalledTimes(1);
  });
});
