import 'server-only';

import { subscriptionService } from '@/entities/subscription/service';
import { EntitlementError } from '@/shared/billing/errors';
import {
  FREE_PLAN,
  PLANS,
  getPlanById,
  type Plan,
  type PlanId,
} from '@/shared/billing/plans';

// Stripe statuses that mean "the owner is currently paying". Everything
// else (canceled, past_due, incomplete, no row at all) falls back to free.
const PAID_STATUSES = new Set(['active', 'trialing']);

// Resolves an owner's effective plan from their subscription row, defaulting
// to free. The one place this milestone's paid-feature checks read from.
export async function getPlanForOwner(ownerId: string): Promise<Plan> {
  const subscription = await subscriptionService.findByOwnerId(ownerId);
  if (subscription && PAID_STATUSES.has(subscription.status)) {
    return getPlanById(subscription.plan as PlanId);
  }
  return FREE_PLAN;
}

// Whether `plan` meets or exceeds `requiredPlanId`'s tier. PLANS is ordered
// lowest-to-highest, so index comparison is tier ordering - the one place
// that ordering is read, so a non-throwing check (e.g. deciding whether to
// render a gated panel) never has to re-derive it as a raw `plan.id === X`.
export function meetsPlan(plan: Plan, requiredPlanId: PlanId): boolean {
  const requiredIndex = PLANS.findIndex(
    (candidate) => candidate.id === requiredPlanId,
  );
  const currentIndex = PLANS.findIndex((candidate) => candidate.id === plan.id);
  return currentIndex >= requiredIndex;
}

// Throws when the owner's current plan doesn't include the required tier.
export async function requirePlan(
  ownerId: string,
  planId: PlanId,
): Promise<Plan> {
  const plan = await getPlanForOwner(ownerId);

  if (!meetsPlan(plan, planId)) {
    const requiredPlan = getPlanById(planId);
    throw new EntitlementError(
      `This feature requires the ${requiredPlan.name} plan.`,
      { plan: plan.id, limit: 0 },
    );
  }

  return plan;
}

// Throws when `used` has already reached the plan's monthly AI-action
// allowance. Counting `used` is TASK-059's job; this only enforces the cap.
export function assertWithinLimit(used: number, plan: Plan): void {
  if (used >= plan.aiActionsPerMonth) {
    throw new EntitlementError(
      `You've used all ${plan.aiActionsPerMonth} AI actions included in the ${plan.name} plan this month.`,
      { plan: plan.id, limit: plan.aiActionsPerMonth },
    );
  }
}
