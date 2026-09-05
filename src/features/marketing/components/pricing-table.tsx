import Link from 'next/link';
import { Check } from 'lucide-react';

// CheckoutButton lives in this feature, not features/billing, because FSA
// forbids feature-to-feature imports (eslint import/no-restricted-paths) and
// this pricing table is its only consumer; create-checkout-session.service.ts
// (the actual Stripe call) is the piece that belongs to features/billing.
import { CheckoutButton } from '@/features/marketing/components/checkout-button';
import { subscriptionService } from '@/entities/subscription/service';
import { createClient } from '@/shared/db/client';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { Grid, HStack, Heading, Text, VStack } from '@/shared/ui/primitives';

export type PlanId = 'free' | 'pro';

export interface Plan {
  id: PlanId;
  name: string;
  price: string;
  pricePeriod: string;
  tagline: string;
  /** Monthly AI-action allowance. TASK-058/059 read this. */
  aiActionsPerMonth: number;
  features: string[];
  cta: string;
  featured: boolean;
}

// Single source of truth for plan names, limits and prices. Mirrors the
// "Pricing & Packaging" section of docs/PRODUCT.md; TASK-056 (Stripe prices),
// TASK-058 (entitlement gate) and TASK-059 (usage quota) read from here.
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

export async function PricingTable() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isSignedIn = Boolean(user);
  const subscription = user
    ? await subscriptionService.findByOwnerId(user.id)
    : null;
  const isPro = subscription
    ? ['active', 'trialing'].includes(subscription.status)
    : false;

  return (
    <Grid cols={1} colsMd={2} gap={6}>
      {PLANS.map((plan) => (
        <Card
          key={plan.id}
          className={plan.featured ? 'ring-2 ring-primary' : undefined}
        >
          <CardHeader>
            <VStack gap={2}>
              <Heading level={2}>{plan.name}</Heading>
              <HStack gap={2} align="baseline">
                <Heading level={1}>{plan.price}</Heading>
                <Text color="muted">{plan.pricePeriod}</Text>
              </HStack>
              <Text color="muted">{plan.tagline}</Text>
            </VStack>
          </CardHeader>
          <CardContent>
            <VStack gap={4}>
              <VStack gap={2}>
                {plan.features.map((feature) => (
                  <HStack key={feature} gap={2} align="start">
                    <Check
                      className="size-4 shrink-0 text-primary"
                      aria-hidden
                    />
                    <Text>{feature}</Text>
                  </HStack>
                ))}
              </VStack>
              {isSignedIn ? (
                plan.id === (isPro ? 'pro' : 'free') ? (
                  <Button variant="outline" className="w-full" disabled>
                    Current plan
                  </Button>
                ) : isPro ? (
                  <Button variant="outline" className="w-full" disabled>
                    Included
                  </Button>
                ) : (
                  <CheckoutButton
                    plan="pro"
                    label={plan.cta}
                    featured={plan.featured}
                  />
                )
              ) : (
                <Button
                  asChild
                  variant={plan.featured ? 'default' : 'outline'}
                  className="w-full"
                >
                  <Link href="/sign-up">{plan.cta}</Link>
                </Button>
              )}
            </VStack>
          </CardContent>
        </Card>
      ))}
    </Grid>
  );
}
