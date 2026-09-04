import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { PricingTable } from '@/features/marketing/components/pricing-table';
import { createClient } from '@/shared/db/client';
import { Button } from '@/shared/ui/button';
import { Grid, HStack, Heading, Text, VStack } from '@/shared/ui/primitives';

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
      <VStack gap={4} align="start">
        <Heading level={1}>
          Get more recruiter attention and never lose track of an application
        </Heading>
        <Text size="lg" color="muted">
          AI Career OS tailors your CV and recruiter messages to each job offer
          and keeps every application, CV and message in one searchable place.
        </Text>
        <HStack gap={2}>
          <Button asChild>
            <Link href="/sign-up">Create your account</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/pricing">See pricing</Link>
          </Button>
        </HStack>
      </VStack>

      <Grid cols={1} colsMd={3} gap={6}>
        {HIGHLIGHTS.map((item) => (
          <VStack key={item.title} gap={2} align="start">
            <Heading level={3}>{item.title}</Heading>
            <Text color="muted">{item.body}</Text>
          </VStack>
        ))}
      </Grid>

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
