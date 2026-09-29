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
import { Grid, HStack, Heading, Text, VStack } from '@/shared/ui/primitives';

// Applies tabular-nums to the plan's AI-action allowance within a feature
// line by locating the real number (plan.aiActionsPerMonth), not by
// guessing from prose - so rewording the copy in plans.ts can't silently
// break this.
function formatFeature(feature: string, aiActionsPerMonth: number) {
  const allowance = String(aiActionsPerMonth);
  const index = feature.indexOf(allowance);
  if (index === -1) return feature;
  return (
    <>
      {feature.slice(0, index)}
      <span className="tabular-nums">{allowance}</span>
      {feature.slice(index + allowance.length)}
    </>
  );
}

// userId is optional so the two other call sites (landing page, onboarding
// panel) keep doing their own auth check; /pricing passes it explicitly so
// that page shares one auth lookup with SignedInHeader instead of each
// component fetching it separately.
export async function PricingTable({
  userId: userIdProp,
}: { userId?: string | null } = {}) {
  let userId = userIdProp ?? null;
  if (userIdProp === undefined) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  }
  const isSignedIn = Boolean(userId);
  const subscription = userId
    ? await subscriptionService.findByOwnerId(userId)
    : null;
  const isPro = subscription
    ? ['active', 'trialing'].includes(subscription.status)
    : false;

  return (
    <Grid cols={1} colsMd={2} gap={6}>
      {PLANS.map((plan) => (
        <Card
          key={plan.id}
          className={
            plan.featured
              ? 'flex h-full flex-col border-foreground'
              : 'flex h-full flex-col'
          }
        >
          <CardHeader>
            <VStack gap={2}>
              <HStack gap={2} align="center">
                <Heading
                  level={2}
                  className={plan.featured ? 'font-bold' : undefined}
                >
                  {plan.name}
                </Heading>
                {plan.featured && (
                  <Text size="sm" color="muted">
                    Recommended
                  </Text>
                )}
              </HStack>
              <HStack gap={2} align="baseline">
                <Heading level={1} className="tabular-nums">
                  {plan.price}
                </Heading>
                <Text color="muted">{plan.pricePeriod}</Text>
              </HStack>
              <Text color="muted">{plan.tagline}</Text>
            </VStack>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            <VStack gap={4} justify="between" className="h-full">
              <VStack gap={0}>
                {plan.features.map((feature) => (
                  <HStack
                    key={feature}
                    gap={2}
                    align="start"
                    className="border-t border-border py-2.5 first:border-t-0 first:pt-0"
                  >
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
                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full"
                    disabled
                  >
                    Current plan
                  </Button>
                ) : isPro ? (
                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full"
                    disabled
                  >
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
                  variant={plan.featured ? 'primary' : 'secondary'}
                  size="lg"
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
