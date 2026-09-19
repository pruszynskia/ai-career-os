import Link from 'next/link';
import type { Metadata } from 'next';

import { PricingTable } from '@/features/marketing/components/pricing-table';
import { PRO_CAPABILITY_NAMES } from '@/shared/billing/plans';
import { Button } from '@/shared/ui/button';
import { HStack, Heading, Text, VStack } from '@/shared/ui/primitives';

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

export default function PricingPage() {
  return (
    <VStack gap={8}>
      <VStack gap={3} align="start">
        <Heading level={1}>Pricing</Heading>
        <Text size="lg" color="muted">
          Every plan includes the full application tracker, your match score and
          your monthly AI-action allowance. Pro adds the {proCapabilityList}{' '}
          that show where a reply is actually likely.
        </Text>
      </VStack>

      <PricingTable />

      <HStack gap={2} align="center">
        <Text color="muted">Ready to start?</Text>
        <Button asChild>
          <Link href="/sign-up">Create your account</Link>
        </Button>
      </HStack>
    </VStack>
  );
}
