import Link from 'next/link';
import type { Metadata } from 'next';

import { PricingTable } from '@/features/marketing/components/pricing-table';
import { Button } from '@/shared/ui/button';
import { HStack, Heading, Text, VStack } from '@/shared/ui/primitives';

// PricingTable reads the signed-in user's subscription per request.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Pricing — AI Career OS',
  description:
    'AI Career OS pricing: a free plan with 10 AI actions a month and a Pro plan with 500.',
};

export default function PricingPage() {
  return (
    <VStack gap={8}>
      <VStack gap={3} align="start">
        <Heading level={1}>Pricing</Heading>
        <Text size="lg" color="muted">
          Every plan includes the full application tracker. The plan sets how
          many AI actions you get each month.
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
