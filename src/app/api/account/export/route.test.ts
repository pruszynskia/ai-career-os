import { beforeEach, describe, expect, it, vi } from 'vitest';

const plan = vi.hoisted(() => ({ id: 'free' }));

vi.mock('@/shared/auth/session', () => ({ getOwnerId: async () => 'owner' }));
vi.mock('@/shared/billing/entitlements', () => ({
  getPlanForOwner: async () => plan.id,
  meetsPlan: (current: string, required: string) =>
    current === required || current === 'pro',
}));
vi.mock('@/entities/job-offer/service', () => ({
  jobOfferService: { findMany: async () => [{ id: 'o1', fit: { score: 80 } }] },
}));
vi.mock('@/entities/cv-document/service', () => ({
  cvDocumentService: {
    findMany: async () => [{ id: 'c1', tailoringReport: { keywords: [] } }],
  },
}));
vi.mock('@/entities/profile/service', () => ({
  profileService: { findUnique: async () => null },
}));
vi.mock('@/entities/application/service', () => ({
  applicationService: { findMany: async () => [] },
}));
vi.mock('@/entities/post/service', () => ({
  postService: { findMany: async () => [] },
}));
vi.mock('@/entities/application-status-event/service', () => ({
  applicationStatusEventService: { findAllByOwnerId: async () => [] },
}));
vi.mock('@/entities/subscription/service', () => ({
  subscriptionService: { findByOwnerId: async () => null },
}));
vi.mock('@/entities/contact/service', () => ({
  contactService: { findAllByOwnerId: async () => [] },
}));

vi.mock('@/entities/outreach-message/service', () => ({
  outreachMessageService: { findAllByOwnerId: async () => [{ id: 'm1' }] },
}));
vi.mock('@/entities/post-campaign/service', () => ({
  postCampaignService: { findMany: async () => [{ id: 'pc1' }] },
}));
vi.mock('@/entities/ai-usage/service', () => ({
  aiUsageService: { findAllByOwnerId: async () => [{ action: 'match' }] },
}));

const { GET } = await import('./route');

describe('GET /api/account/export', () => {
  beforeEach(() => {
    plan.id = 'free';
  });

  it('strips Pro-only reports for a Free owner', async () => {
    const body = await (await GET()).json();
    expect(body.jobOffers[0].fit).toBeNull();
    expect(body.cvDocuments[0].tailoringReport).toBeNull();
  });

  it('includes outreach, campaigns and AI usage', async () => {
    const body = await (await GET()).json();
    expect(body.outreachMessages).toHaveLength(1);
    expect(body.postCampaigns).toHaveLength(1);
    expect(body.aiUsage).toHaveLength(1);
  });

  it('keeps Pro-only reports for a Pro owner', async () => {
    plan.id = 'pro';
    const body = await (await GET()).json();
    expect(body.jobOffers[0].fit).toEqual({ score: 80 });
    expect(body.cvDocuments[0].tailoringReport).toEqual({ keywords: [] });
  });
});
