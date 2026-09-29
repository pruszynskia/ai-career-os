import Link from 'next/link';

import type { ParsedProfile, Profile } from '@/entities/profile/types';
import { profileService } from '@/entities/profile/service';
import { CvUploadForm } from '@/features/cv/components/cv-upload-form';
import { AddOfferForm } from '@/features/job-offer/components/add-offer-form';
import { PricingTable } from '@/features/marketing/components/pricing-table';
import { OnboardingStepper } from '@/features/onboarding/components/onboarding-stepper';
import { completeOnboarding } from '@/features/onboarding/services/complete-onboarding.service';
import { getOwnerId } from '@/shared/auth/session';
import { Banner } from '@/shared/ui/banner';
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

export async function OnboardingPanel({ step }: { step: number }) {
  if (step >= DONE_STEP) return <OnboardingDoneStep />;

  const isLastFormStep = step >= FORM_STEPS;
  // uploadCv's mutation return value is discarded client-side by design
  // (see useUploadCv) - its onSuccess calls router.refresh(), which
  // re-renders this server component with the just-upserted profile, so the
  // done-state summary always reflects a fresh owner-scoped read.
  const profile =
    step === 2 ? await profileService.findUnique(await getOwnerId()) : null;

  return (
    <VStack gap={6}>
      <OnboardingStepper steps={STEPS} currentStep={step} />

      {step === 1 && <PricingTable />}
      {step === 2 && (
        <Card>
          <CardContent>
            {profile ? <CvUploadSummary profile={profile} /> : <CvUploadForm />}
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

function CvUploadSummary({ profile }: { profile: Profile }) {
  const experience = profile.experience as ParsedProfile['experience'];
  const projects = (profile.projects ?? []) as ParsedProfile['projects'];

  return (
    <VStack gap={4}>
      <VStack gap={1}>
        <Text as="span" size="sm" weight="medium">
          Upload CV (PDF or DOCX)
        </Text>
        <Text size="xs" color="muted">
          Your CV becomes the verified record every tailored CV, message and
          post is generated from.
        </Text>
      </VStack>
      <Banner tone="success">CV uploaded. Your profile is ready.</Banner>
      <Text size="sm">{profile.summary}</Text>
      <VStack gap={0}>
        <SummaryRow
          label="Skills"
          value={`${profile.skills.length} skill${profile.skills.length === 1 ? '' : 's'}`}
        />
        <SummaryRow
          label="Experience"
          value={`${experience.length} role${experience.length === 1 ? '' : 's'}`}
        />
        <SummaryRow
          label="Projects"
          value={`${projects.length} project${projects.length === 1 ? '' : 's'}`}
        />
      </VStack>
      <Text size="xs" color="muted">
        You can review claims and replace your CV any time in Profile.
      </Text>
    </VStack>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <HStack
      justify="between"
      className="border-t border-border py-2.5 first:border-t-0"
    >
      <Text size="sm" color="muted">
        {label}
      </Text>
      <Text size="sm">{value}</Text>
    </HStack>
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
