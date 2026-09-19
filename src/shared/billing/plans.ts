// Single source of truth for plan names, limits and prices. Mirrors the
// "Pricing & Packaging" section of docs/PRODUCT.md; TASK-058's entitlement
// gate and TASK-059's usage quota read from here, and the pricing table
// renders it, so a tier never gets defined twice.
//
// Plans are ordered lowest-to-highest tier - src/shared/billing/entitlements.ts
// compares array index to decide whether a plan meets a requirement.
export type PlanId = 'free' | 'pro';

// The capabilities TASK-088 gates behind Pro via requirePlan(ownerId, 'pro')
// - src/app/(app)/(protected)/offers/[id]/page.tsx (fit report detail,
// tailoring report), src/app/api/offers/[id]/outreach/route.ts and its
// follow-up/route.ts sibling (outreach studio, both the initial draft and
// the follow-up) and src/features/dashboard/services/response-rate-readout.service.ts
// (outcome readout) each check the same tier, so this is the one place their
// names are written down - Pro's feature bullets below quote it directly
// rather than restating it.
interface ProCapability {
  name: string;
  description: string;
}

const PRO_CAPABILITY_LIST: readonly ProCapability[] = [
  {
    name: 'Full fit report',
    description: 'criteria breakdown, callback probability and missing skills',
  },
  {
    name: 'Tailoring report',
    description: 'keyword coverage and evidence trace on every tailored CV',
  },
  {
    name: 'Outreach studio',
    description: 'channel-specific drafts and ban-list validation',
  },
  {
    name: 'Outcome readout',
    description: 'response rates by fit band, callback band and channel',
  },
];

export const PRO_CAPABILITIES: readonly string[] = PRO_CAPABILITY_LIST.map(
  (capability) => `${capability.name} — ${capability.description}`,
);

// Short names for the same four capabilities, for copy that reads as a
// sentence rather than a bulleted list (the marketing landing page and the
// pricing page intro) - derived so that copy can't drift from the list above.
export const PRO_CAPABILITY_NAMES: readonly string[] = PRO_CAPABILITY_LIST.map(
  (capability) => capability.name.toLowerCase(),
);

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
      'Unlimited job offers and applications, master profile and CV',
      'Duplicate-offer detection and interview pipeline',
      'AI match score, tailored CVs and LinkedIn posts',
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
    tagline:
      'See why an offer is worth the effort, and where a reply is likely.',
    aiActionsPerMonth: 500,
    features: [
      'Everything in Free',
      ...PRO_CAPABILITIES,
      '500 AI actions per month',
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
