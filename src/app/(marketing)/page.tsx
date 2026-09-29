import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

import { FitReportFrame } from '@/features/marketing/components/fit-report-frame';
import { OffersFrame } from '@/features/marketing/components/offers-frame';
import { PricingTable } from '@/features/marketing/components/pricing-table';
import { PRO_CAPABILITY_NAMES } from '@/shared/billing/plans';
import { createClient } from '@/shared/db/client';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { Tag } from '@/shared/ui/tag';
import {
  Divider,
  Grid,
  HStack,
  Heading,
  SectionLabel,
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

// Section order/copy intent from docs/design-system/mockups/X-landing.dc.html.
// The Pro-vs-Free promise (TASK-088) lives in the third item's body rather
// than a fourth column, so the mockup's 3-column grid stays 3 columns.
const VALUE_POINTS = [
  {
    title: 'One verified record',
    body: 'Your CV becomes a set of claims you can confirm, downplay or exclude. Everything else is generated from it, and nothing is added.',
  },
  {
    title: 'Every offer, ranked',
    body: 'Paste a link or the posting text. Duplicates are caught, and offers are grouped by where a reply is likely.',
  },
  {
    title: 'Applications with evidence',
    body: `Tailored CVs, cover letters and recruiter messages, each traceable to the claim behind it. ${proCapabilityListCapitalized} (Pro) show exactly where the effort pays off.`,
  },
];

const FAQ_ITEMS = [
  {
    question: 'Does it ever send messages for me?',
    answer:
      'No. Every CV, cover letter and recruiter message is a draft for you to review, copy and send yourself. You mark it as sent when you do.',
  },
  {
    question: 'Where does the tailored content come from?',
    answer:
      'Only from your verified record: the claims parsed from your CV, which you can confirm, downplay or exclude. Nothing is invented to fit an offer.',
  },
  {
    question: 'What happens if I add the same offer twice?',
    answer:
      'It is caught by the same link, identical offer text, or the same company and title, and you choose whether to keep both or delete the new one.',
  },
  {
    question: 'What is the difference between Free and Pro?',
    answer:
      'Free covers the whole application tracker, your match score and 10 AI actions a month. Pro adds the full fit report, tailoring report, outreach studio, and outcome readout, with 500 AI actions a month.',
  },
  {
    question: 'Can I export or delete my data?',
    answer:
      'Yes. Settings lets you download everything the account owns as a JSON file, or delete the account and all of its data.',
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
          <SectionLabel>One verified record of your job search</SectionLabel>
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
            <Button asChild variant="secondary">
              <Link href="/pricing">See pricing</Link>
            </Button>
          </HStack>
          <Text size="sm" color="muted">
            Free plan, no credit card required.
          </Text>
        </VStack>
      </Grid>

      <Grid cols={1} colsMd={2} gap={6}>
        <OffersFrame />
        <FitReportFrame />
      </Grid>

      <Divider />

      <Grid cols={1} colsMd={3} gap={8}>
        {VALUE_POINTS.map((item) => (
          <VStack
            key={item.title}
            gap={2}
            align="start"
            className="border-t border-border pt-5"
          >
            <Heading level={3}>{item.title}</Heading>
            <Text color="muted">{item.body}</Text>
          </VStack>
        ))}
      </Grid>

      <Divider />

      <Grid cols={1} colsMd={2} gap={8} className="md:items-center">
        <VStack gap={3} align="start">
          <Heading level={2}>It won&apos;t lie about you.</Heading>
          <Text color="muted" className="max-w-[52ch]">
            Claims with numbers, seniority or leadership scope are the ones a
            recruiter checks. They&apos;re shown to you first, and you
            decide: confirm, downplay, or never use.
          </Text>
        </VStack>
        <Card>
          <CardContent className="flex flex-col gap-3 pt-4">
            <HStack gap={2} align="center">
              <Text size="xs" color="muted">
                Experience
              </Text>
              <Tag size="sm">Has a number</Tag>
            </HStack>
            <Text>
              Personally implemented about 80% of the Create Order Flow at TD
              SYNNEX.
            </Text>
            <HStack gap={2}>
              <Button size="sm" variant="secondary" disabled>
                Confirm
              </Button>
              <Button size="sm" variant="quiet" disabled>
                Downplay
              </Button>
              <Button size="sm" variant="quiet" disabled>
                Exclude
              </Button>
            </HStack>
          </CardContent>
        </Card>
      </Grid>

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

      <Divider />

      <VStack gap={2} align="start">
        <Heading level={2}>Questions</Heading>
        <VStack gap={0} className="w-full">
          {FAQ_ITEMS.map((item) => (
            <Grid
              key={item.question}
              cols={1}
              colsMd={2}
              gap={6}
              className="border-t border-border py-5 first:border-t-0"
            >
              <Heading level={4}>{item.question}</Heading>
              <Text color="muted">{item.answer}</Text>
            </Grid>
          ))}
        </VStack>
      </VStack>

      <Divider />

      <HStack
        gap={4}
        align="center"
        justify="between"
        className="flex-wrap py-4"
      >
        <Heading level={2}>Start with your CV.</Heading>
        <Button asChild size="lg">
          <Link href="/sign-up">Create your account</Link>
        </Button>
      </HStack>
    </VStack>
  );
}
