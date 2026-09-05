import Link from 'next/link';

import { CvUploadForm } from '@/features/cv/components/cv-upload-form';
import { AddOfferForm } from '@/features/job-offer/components/add-offer-form';
import { PricingTable } from '@/features/marketing/components/pricing-table';
import { OnboardingStepper } from '@/features/onboarding/components/onboarding-stepper';
import { completeOnboarding } from '@/features/onboarding/services/complete-onboarding.service';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { HStack, VStack } from '@/shared/ui/primitives';

const STEPS = [
  'Choose a plan',
  'Upload your CV',
  'Add your first offer',
] as const;
const LAST_STEP = STEPS.length;

export function OnboardingPanel({ step }: { step: number }) {
  const isLastStep = step >= LAST_STEP;

  return (
    <VStack gap={6}>
      <OnboardingStepper steps={STEPS} currentStep={step} />

      <Card>
        <CardContent>
          <VStack gap={4}>
            {step === 1 && <PricingTable />}
            {step === 2 && <CvUploadForm />}
            {step >= LAST_STEP && <AddOfferForm />}

            <HStack justify="between" align="center">
              <HStack gap={2}>
                {step > 1 && (
                  <Button asChild variant="outline">
                    <Link href={`/onboarding?step=${step - 1}`}>Back</Link>
                  </Button>
                )}
                {!isLastStep && (
                  <Button asChild>
                    <Link href={`/onboarding?step=${step + 1}`}>Next</Link>
                  </Button>
                )}
              </HStack>

              <form action={completeOnboarding}>
                <Button
                  type="submit"
                  variant={isLastStep ? 'default' : 'ghost'}
                >
                  {isLastStep ? 'Finish' : 'Skip for now'}
                </Button>
              </form>
            </HStack>
          </VStack>
        </CardContent>
      </Card>
    </VStack>
  );
}
