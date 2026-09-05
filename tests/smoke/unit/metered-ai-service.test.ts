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
vi.mock('@/shared/ai/adapters/anthropic', () => ({
  createAnthropicAdapter: vi.fn(() => ({
    generateStructured: vi.fn().mockResolvedValue({ ok: true }),
  })),
}));
vi.mock('@/shared/ai/adapters/gemini', () => ({
  createGeminiAdapter: vi.fn(),
}));
vi.mock('@/shared/ai/adapters/openai', () => ({
  createOpenAiAdapter: vi.fn(),
}));

import { aiUsageService } from '@/entities/ai-usage/service';
import { getMeteredAiService } from '@/shared/ai/service';
import { getOwnerId } from '@/shared/auth/session';
import {
  assertWithinLimit,
  getPlanForOwner,
} from '@/shared/billing/entitlements';
import { EntitlementError } from '@/shared/billing/errors';
import { FREE_PLAN } from '@/shared/billing/plans';

beforeEach(() => {
  vi.clearAllMocks();
  process.env.ANTHROPIC_API_KEY = 'test-key';
  vi.mocked(getOwnerId).mockResolvedValue('owner_1');
  vi.mocked(getPlanForOwner).mockResolvedValue(FREE_PLAN);
  vi.mocked(aiUsageService.countForOwnerSince).mockResolvedValue(0);
  vi.mocked(assertWithinLimit).mockImplementation(() => {});
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

  it('records exactly one usage row for the calling owner after a successful call', async () => {
    const service = await getMeteredAiService('optimize_cv');
    await service.generateStructured({
      messages: [],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      schema: {} as any,
      schemaName: 'test',
    });

    expect(aiUsageService.record).toHaveBeenCalledTimes(1);
    expect(aiUsageService.record).toHaveBeenCalledWith({
      ownerId: 'owner_1',
      action: 'optimize_cv',
    });
  });
});
