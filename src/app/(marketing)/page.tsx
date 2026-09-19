import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { PricingTable } from '@/features/marketing/components/pricing-table';
import { PRO_CAPABILITY_NAMES } from '@/shared/billing/plans';
import { createClient } from '@/shared/db/client';
import { Button } from '@/shared/ui/button';
import {
  Divider,
  Grid,
  HStack,
  Heading,
  Label,
  Text,
  VStack,
} from '@/shared/ui/primitives';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'AI Career OS — one verified record of what you have actually done',
  description:
    'AI Career OS keeps one verified record of what you have actually done. Every tailored CV, recruiter message and LinkedIn post is generated only from it, and Pro shows where the effort actually pays off.',
};

const proCapabilityList = new Intl.ListFormat('en', {
  style: 'long',
  type: 'conjunction',
}).format(PRO_CAPABILITY_NAMES);
const proCapabilityListCapitalized =
  proCapabilityList.charAt(0).toUpperCase() + proCapabilityList.slice(1);

// One product, two things that fall out of the same promise (docs/ROADMAP.md
// "Stage 3 - Evidence and Signal") - not three unrelated feature bullets.
const PROMISE_POINTS = [
  {
    title: "It won't lie about you",
    body: 'Every tailored CV, recruiter message and LinkedIn post is generated only from one verified record of what you have actually done, with every claim traceable back to it.',
  },
  {
    title: 'It tells you where a reply is likely',
    body: `${proCapabilityListCapitalized} (Pro) show which offers are worth the effort, instead of spending it evenly across every one.`,
  },
];

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <VStack gap={12}>
      <Grid cols={1} colsMd={12} gap={8}>
        <VStack gap={4} align="start" className="md:col-span-8">
          <Label as="span" variant="meta">
            One verified record of your job search
          </Label>
          <Heading level={1} className="text-display">
            One record of what you&apos;ve actually done, and everything else
            generated only from it
          </Heading>
          <Text size="lg" color="muted" className="max-w-[52ch]">
            AI Career OS builds a verified profile from your real experience,
            tracks every application without duplicates, and generates a match
            score, a tailored CV and LinkedIn posts from that profile — free.
            Pro adds the judgment layer below that shows where the effort
            actually pays off.
          </Text>
        </VStack>
        <VStack
          gap={3}
          align="start"
          className="md:col-span-4 md:justify-end md:pt-12"
        >
          <HStack gap={2}>
            <Button asChild>
              <Link href="/sign-up">Create your account</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/pricing">See pricing</Link>
            </Button>
          </HStack>
          <Text size="sm" color="muted">
            Free plan, no credit card required.
          </Text>
        </VStack>
      </Grid>

      <Divider />

      <VStack gap={2} align="start">
        <Heading level={2}>
          One promise: it won&apos;t lie about you, and it tells you where the
          effort pays off
        </Heading>
      </VStack>

      <VStack gap={0}>
        {PROMISE_POINTS.map((item, index) => (
          <HStack
            key={item.title}
            gap={6}
            align="start"
            className="border-b border-border py-6 last:border-b-0"
          >
            <Text as="span" color="muted" className="w-8 shrink-0 font-mono">
              {String(index + 1).padStart(2, '0')}
            </Text>
            <VStack gap={1}>
              <Heading level={3}>{item.title}</Heading>
              <Text color="muted" className="max-w-[60ch]">
                {item.body}
              </Text>
            </VStack>
          </HStack>
        ))}
      </VStack>

      <Divider />

      <VStack gap={6}>
        <VStack gap={2} align="start">
          <Heading level={2}>Simple pricing</Heading>
          <Text color="muted">
            Start free, upgrade when you want more AI actions each month.
          </Text>
        </VStack>
        <PricingTable />
      </VStack>
    </VStack>
  );
}
