import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('@/entities/subscription/service', () => ({
  subscriptionService: {
    findByOwnerId: vi.fn(),
  },
}));

import { subscriptionService } from '@/entities/subscription/service';
import {
  assertWithinLimit,
  getPlanForOwner,
  requirePlan,
} from '@/shared/billing/entitlements';
import { EntitlementError } from '@/shared/billing/errors';
import { PLANS } from '@/shared/billing/plans';
import type { SubscriptionStatus } from '@/entities/subscription/types';

function fakeSubscription(status: SubscriptionStatus, plan = 'pro') {
  return {
    id: 'sub_row_1',
    ownerId: 'owner_1',
    stripeCustomerId: 'cus_1',
    stripeSubscriptionId: 'sub_1',
    status,
    plan,
    currentPeriodEnd: null,
    lastStripeEventAt: null,
    createdAt: new Date(0),
    updatedAt: new Date(0),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getPlanForOwner', () => {
  it('returns the paid plan for an active subscription', async () => {
    vi.mocked(subscriptionService.findByOwnerId).mockResolvedValue(
      fakeSubscription('active'),
    );
    expect((await getPlanForOwner('owner_1')).id).toBe('pro');
  });

  it('returns the paid plan for a trialing subscription', async () => {
    vi.mocked(subscriptionService.findByOwnerId).mockResolvedValue(
      fakeSubscription('trialing'),
    );
    expect((await getPlanForOwner('owner_1')).id).toBe('pro');
  });

  it.each<SubscriptionStatus>([
    'past_due',
    'canceled',
    'incomplete',
    'incomplete_expired',
    'unpaid',
    'paused',
  ])('returns the free plan for a %s subscription', async (status) => {
    vi.mocked(subscriptionService.findByOwnerId).mockResolvedValue(
      fakeSubscription(status),
    );
    expect((await getPlanForOwner('owner_1')).id).toBe('free');
  });

  it('returns the free plan when there is no subscription row', async () => {
    vi.mocked(subscriptionService.findByOwnerId).mockResolvedValue(null);
    expect((await getPlanForOwner('owner_1')).id).toBe('free');
  });
});

describe('requirePlan', () => {
  it('throws EntitlementError when the free plan is asked for pro', async () => {
    vi.mocked(subscriptionService.findByOwnerId).mockResolvedValue(null);
    await expect(requirePlan('owner_1', 'pro')).rejects.toBeInstanceOf(
      EntitlementError,
    );
  });

  it('resolves with the plan when the owner already meets the requirement', async () => {
    vi.mocked(subscriptionService.findByOwnerId).mockResolvedValue(
      fakeSubscription('active'),
    );
    await expect(requirePlan('owner_1', 'pro')).resolves.toMatchObject({
      id: 'pro',
    });
  });
});

describe('assertWithinLimit', () => {
  const freePlan = PLANS.find((plan) => plan.id === 'free')!;

  it('throws a 402-shaped EntitlementError once the allowance is used up', () => {
    expect(() =>
      assertWithinLimit(freePlan.aiActionsPerMonth, freePlan),
    ).toThrow(EntitlementError);
  });

  it('does not throw while usage is below the allowance', () => {
    expect(() =>
      assertWithinLimit(freePlan.aiActionsPerMonth - 1, freePlan),
    ).not.toThrow();
  });
});
