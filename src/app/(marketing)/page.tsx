import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { PricingTable } from '@/features/marketing/components/pricing-table';
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
  title:
    'AI Career OS — AI-tailored CVs and a duplicate-free application tracker',
  description:
    'Tailor your CV and recruiter messages to every job offer with AI, and track every application in one searchable place.',
};

const HIGHLIGHTS = [
  {
    title: 'AI-tailored applications',
    body: 'Generate a match score, a tailored CV and a recruiter message for every offer from a pasted link or raw text.',
  },
  {
    title: 'One duplicate-free pipeline',
    body: 'Every application links back to one offer, one sent CV and one message, and cross-portal duplicates are flagged when you add them.',
  },
  {
    title: 'A consistent LinkedIn presence',
    body: 'Draft and schedule posts from your profile, with AI planning the next ones from what you have already posted.',
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
            AI-tailored job search
          </Label>
          <Heading level={1} className="text-display">
            Get more recruiter attention and never lose track of an application
          </Heading>
          <Text size="lg" color="muted" className="max-w-[52ch]">
            AI Career OS tailors your CV and recruiter messages to each job
            offer and keeps every application, CV and message in one searchable
            place.
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

      <VStack gap={0}>
        {HIGHLIGHTS.map((item, index) => (
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
