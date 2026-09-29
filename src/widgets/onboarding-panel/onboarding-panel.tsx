import Link from 'next/link';

import { CvUploadForm } from '@/features/cv/components/cv-upload-form';
import { AddOfferForm } from '@/features/job-offer/components/add-offer-form';
import { PricingTable } from '@/features/marketing/components/pricing-table';
import { OnboardingStepper } from '@/features/onboarding/components/onboarding-stepper';
import { completeOnboarding } from '@/features/onboarding/services/complete-onboarding.service';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { HStack, Text, VStack } from '@/shared/ui/primitives';

const STEPS = [
  'Choose a plan',
  'Upload your CV',
  'Add your first offer',
] as const;
const FORM_STEPS = STEPS.length;
const DONE_STEP = FORM_STEPS + 1;

export function OnboardingPanel({ step }: { step: number }) {
  if (step >= DONE_STEP) return <OnboardingDoneStep />;

  const isLastFormStep = step >= FORM_STEPS;

  return (
    <VStack gap={6}>
      <OnboardingStepper steps={STEPS} currentStep={step} />

      {step === 1 && <PricingTable />}
      {step === 2 && (
        <Card>
          <CardContent>
            <CvUploadForm />
          </CardContent>
        </Card>
      )}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Add your first offer</CardTitle>
          </CardHeader>
          <CardContent>
            <Text size="sm" color="muted" className="mb-3">
              Paste a link to a job posting or its full text.
            </Text>
            <AddOfferForm />
          </CardContent>
        </Card>
      )}

      <HStack justify="between" align="center">
        {isLastFormStep ? (
          <>
            <Button asChild variant="secondary" size="lg">
              <Link href={`/onboarding?step=${step - 1}`}>Back</Link>
            </Button>
            <Button asChild size="lg">
              <Link href={`/onboarding?step=${step + 1}`}>Finish</Link>
            </Button>
          </>
        ) : (
          <>
            <HStack gap={2}>
              {step > 1 && (
                <Button asChild variant="secondary" size="lg">
                  <Link href={`/onboarding?step=${step - 1}`}>Back</Link>
                </Button>
              )}
              <Button asChild size="lg">
                <Link href={`/onboarding?step=${step + 1}`}>Next</Link>
              </Button>
            </HStack>
            <form action={completeOnboarding}>
              <Button type="submit" variant="quiet" size="lg">
                Skip for now
              </Button>
            </form>
          </>
        )}
      </HStack>
    </VStack>
  );
}

function OnboardingDoneStep() {
  return (
    <VStack gap={6}>
      <form action={completeOnboarding}>
        <Button type="submit" size="lg">
          Go to dashboard
        </Button>
      </form>
    </VStack>
  );
}
