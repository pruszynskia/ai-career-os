import Link from 'next/link';

import { OnboardingPanel } from '@/widgets/onboarding-panel/onboarding-panel';
import { Container, Heading, Text } from '@/shared/ui/primitives';

export const dynamic = 'force-dynamic';

// Steps 1-3 are the wizard (plan, CV, first offer); step 4 is the "all set"
// confirmation shown before redirecting to /dashboard.
const FORM_STEPS = 3;
const LAST_STEP = FORM_STEPS + 1;

// Exported for direct unit testing.
export function clampStep(value: number): number {
  if (!Number.isFinite(value) || value < 1) return 1;
  if (value > LAST_STEP) return LAST_STEP;
  return Math.trunc(value);
}

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string }>;
}) {
  const { step } = await searchParams;
  const currentStep = clampStep(Number(step));
  const isDone = currentStep >= LAST_STEP;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 shrink-0 items-center justify-between border-b px-8">
        <Link href="/" className="flex items-center">
          <Heading level={4}>Career OS</Heading>
        </Link>
        {!isDone && (
          <Text as="span" size="sm" color="muted" className="tabular-nums">
            Step {currentStep} of {FORM_STEPS}
          </Text>
        )}
      </header>
      <main className="flex-1">
        <Container size="md" className="flex flex-col gap-7 py-14">
          <div className="flex flex-col gap-2">
            <Heading level={1}>
              {isDone ? "You're all set" : 'Welcome to AI Career OS'}
            </Heading>
            <Text size="lg" color="muted">
              {isDone
                ? 'Your account is ready.'
                : 'A few quick steps to get your account ready.'}
            </Text>
          </div>
          <OnboardingPanel step={currentStep} />
        </Container>
      </main>
    </div>
  );
}
