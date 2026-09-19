import Link from 'next/link';
import { Check } from 'lucide-react';

// CheckoutButton lives in this feature, not features/billing, because FSA
// forbids feature-to-feature imports (eslint import/no-restricted-paths) and
// this pricing table is its only consumer; create-checkout-session.service.ts
// (the actual Stripe call) is the piece that belongs to features/billing.
import { CheckoutButton } from '@/features/marketing/components/checkout-button';
import { subscriptionService } from '@/entities/subscription/service';
import { PLANS } from '@/shared/billing/plans';
import { createClient } from '@/shared/db/client';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import {
  Grid,
  HStack,
  Heading,
  Label,
  Text,
  VStack,
} from '@/shared/ui/primitives';

// Monospaces the plan's AI-action allowance within a feature line by
// locating the real number (plan.aiActionsPerMonth), not by guessing from
// prose - so rewording the copy in plans.ts can't silently break this.
function formatFeature(feature: string, aiActionsPerMonth: number) {
  const allowance = String(aiActionsPerMonth);
  const index = feature.indexOf(allowance);
  if (index === -1) return feature;
  return (
    <>
      {feature.slice(0, index)}
      <span className="font-mono">{allowance}</span>
      {feature.slice(index + allowance.length)}
    </>
  );
}

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
          className={plan.featured ? 'border-foreground' : undefined}
        >
          <CardHeader>
            <VStack gap={2}>
              {plan.featured && (
                <Label as="span" variant="meta" className="text-foreground">
                  Recommended
                </Label>
              )}
              <Heading
                level={2}
                className={plan.featured ? 'font-bold' : undefined}
              >
                {plan.name}
              </Heading>
              <HStack gap={2} align="baseline">
                <Heading level={1} className="font-mono">
                  {plan.price}
                </Heading>
                <Text color="muted" className="font-mono">
                  {plan.pricePeriod}
                </Text>
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
                    <Text>
                      {formatFeature(feature, plan.aiActionsPerMonth)}
                    </Text>
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
