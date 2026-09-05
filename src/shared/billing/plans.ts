// Single source of truth for plan names, limits and prices. Mirrors the
// "Pricing & Packaging" section of docs/PRODUCT.md; TASK-058's entitlement
// gate and TASK-059's usage quota read from here, and the pricing table
// renders it, so a tier never gets defined twice.
//
// Plans are ordered lowest-to-highest tier - src/shared/billing/entitlements.ts
// compares array index to decide whether a plan meets a requirement.
export type PlanId = 'free' | 'pro';

export interface Plan {
  id: PlanId;
  name: string;
  price: string;
  pricePeriod: string;
  tagline: string;
  /** Monthly AI-action allowance. */
  aiActionsPerMonth: number;
  features: string[];
  cta: string;
  featured: boolean;
}

export const PLANS: readonly Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: '€0',
    pricePeriod: 'per month',
    tagline: 'Track your whole job search in one place.',
    aiActionsPerMonth: 10,
    features: [
      'Unlimited job offers and applications',
      'Master profile and CV',
      'Duplicate-offer detection and interview pipeline',
      '10 AI actions per month',
    ],
    cta: 'Get started',
    featured: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '€12',
    pricePeriod: 'per month',
    tagline: 'Tailor every application with AI, without counting actions.',
    aiActionsPerMonth: 500,
    features: [
      'Everything in Free',
      '500 AI actions per month',
      'AI-tailored CVs and recruiter messages',
      'AI-planned LinkedIn posts',
    ],
    cta: 'Upgrade to Pro',
    featured: true,
  },
] as const;

export const FREE_PLAN: Plan = PLANS[0];

export function getPlanById(planId: PlanId): Plan {
  const plan = PLANS.find((candidate) => candidate.id === planId);
  if (!plan) throw new Error(`Unknown plan id "${planId}".`);
  return plan;
}
