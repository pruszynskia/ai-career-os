import Link from 'next/link';
import type { Metadata } from 'next';

import { PricingTable } from '@/features/marketing/components/pricing-table';
import { SignedInHeader } from '@/features/marketing/components/signed-in-header';
import { PRO_CAPABILITY_NAMES } from '@/shared/billing/plans';
import { createClient } from '@/shared/db/client';
import { Banner } from '@/shared/ui/banner';
import { Button } from '@/shared/ui/button';
import { Box, Heading, Text, VStack } from '@/shared/ui/primitives';

// PricingTable reads the signed-in user's subscription per request.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Pricing — AI Career OS',
  description:
    'AI Career OS pricing: a free plan with 10 AI actions a month and a Pro plan with 500.',
};

const proCapabilityList = new Intl.ListFormat('en', {
  style: 'long',
  type: 'conjunction',
}).format(PRO_CAPABILITY_NAMES);

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const { checkout } = await searchParams;

  // Fetched once here and threaded down to SignedInHeader/PricingTable so a
  // single /pricing render only makes one auth round-trip, not three.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isSignedIn = Boolean(user);

  return (
    <VStack gap={8}>
      <SignedInHeader isSignedIn={isSignedIn} />

      {checkout === 'cancelled' && (
        <Banner tone="neutral">
          Checkout was cancelled. Your plan hasn&apos;t changed.
        </Banner>
      )}

      <VStack gap={3} align="start">
        <Heading level={1}>
          {isSignedIn ? 'Choose your plan' : 'Pricing'}
        </Heading>
        <Text size="lg" color="muted">
          Every plan includes the full application tracker, your match score and
          your monthly AI-action allowance. Pro adds the {proCapabilityList}{' '}
          that show where a reply is actually likely.
        </Text>
      </VStack>

      <PricingTable userId={user?.id ?? null} />

      {!isSignedIn && (
        <Box className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border p-4">
          <Text className="font-semibold">Ready to start?</Text>
          <Button asChild size="lg">
            <Link href="/sign-up">Create your account</Link>
          </Button>
        </Box>
      )}
    </VStack>
  );
}
