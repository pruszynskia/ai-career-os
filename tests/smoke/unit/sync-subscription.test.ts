import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('@/shared/db/admin', () => ({
  createAdminClient: vi.fn(() => ({})),
}));
vi.mock('@/entities/subscription/service', () => ({
  subscriptionService: {
    findByOwnerId: vi.fn(),
    findByStripeCustomerId: vi.fn(),
    upsertFromStripe: vi.fn(),
  },
}));

import { subscriptionService } from '@/entities/subscription/service';
import {
  MissingOwnerIdError,
  syncSubscriptionFromStripe,
} from '@/features/billing/services/sync-subscription.service';

function fakeSubscription(overrides: Partial<{ ownerId: string }> = {}) {
  return {
    id: 'sub_1',
    customer: 'cus_1',
    status: 'active',
    metadata: overrides.ownerId ? { owner_id: overrides.ownerId } : {},
    items: { data: [{ current_period_end: 1_700_000_000 }] },
  } as unknown as Parameters<typeof syncSubscriptionFromStripe>[0];
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('syncSubscriptionFromStripe', () => {
  it('throws MissingOwnerIdError when metadata and the customer id both fail to resolve an owner', async () => {
    vi.mocked(subscriptionService.findByStripeCustomerId).mockResolvedValue(null);

    await expect(
      syncSubscriptionFromStripe(fakeSubscription(), 1_700_000_100),
    ).rejects.toBeInstanceOf(MissingOwnerIdError);
    expect(subscriptionService.upsertFromStripe).not.toHaveBeenCalled();
  });

  it('skips an event older than the row already on file (out-of-order delivery)', async () => {
    vi.mocked(subscriptionService.findByOwnerId).mockResolvedValue({
      id: 'row_1',
      ownerId: 'owner_1',
      stripeCustomerId: 'cus_1',
      stripeSubscriptionId: 'sub_1',
      status: 'active',
      plan: 'pro',
      currentPeriodEnd: null,
      createdAt: new Date(0),
      updatedAt: new Date(1_700_000_500_000),
    });

    await syncSubscriptionFromStripe(
      fakeSubscription({ ownerId: 'owner_1' }),
      1_700_000_100, // older than the row's updatedAt
    );

    expect(subscriptionService.upsertFromStripe).not.toHaveBeenCalled();
  });

  it('writes when the event is newer than the row on file', async () => {
    vi.mocked(subscriptionService.findByOwnerId).mockResolvedValue({
      id: 'row_1',
      ownerId: 'owner_1',
      stripeCustomerId: 'cus_1',
      stripeSubscriptionId: 'sub_1',
      status: 'incomplete',
      plan: 'pro',
      currentPeriodEnd: null,
      createdAt: new Date(0),
      updatedAt: new Date(1_700_000_000_000),
    });

    await syncSubscriptionFromStripe(
      fakeSubscription({ ownerId: 'owner_1' }),
      1_700_000_100,
    );

    expect(subscriptionService.upsertFromStripe).toHaveBeenCalledTimes(1);
  });
});
