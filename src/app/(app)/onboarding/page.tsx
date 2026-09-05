import { AppPageLayout } from '@/shared/layouts';
import { OnboardingPanel } from '@/widgets/onboarding-panel/onboarding-panel';

export const dynamic = 'force-dynamic';

function clampStep(value: number): number {
  if (!Number.isFinite(value) || value < 1) return 1;
  if (value > 3) return 3;
  return Math.trunc(value);
}

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string }>;
}) {
  const { step } = await searchParams;

  return (
    <AppPageLayout
      title="Welcome to AI Career OS"
      subtitle="A few quick steps to get your account ready."
    >
      <OnboardingPanel step={clampStep(Number(step))} />
    </AppPageLayout>
  );
}
