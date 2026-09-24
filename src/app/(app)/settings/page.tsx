import {
  aiUsageService,
  startOfCurrentMonth,
} from '@/entities/ai-usage/service';
import { profileService } from '@/entities/profile/service';
import { subscriptionService } from '@/entities/subscription/service';
import { DangerZone } from '@/features/account/components/danger-zone';
import { BillingPanel } from '@/features/billing/components/billing-panel';
import { UsageMeter } from '@/features/billing/components/usage-meter';
import { JobPreferencesForm } from '@/features/profile/components/job-preferences-form';
import { getOwnerId } from '@/shared/auth/session';
import { getPlanForOwner } from '@/shared/billing/entitlements';
import { AppPageLayout } from '@/shared/layouts';
import { EmptyState } from '@/shared/ui/empty-state';
import { SectionLabel, VStack } from '@/shared/ui/primitives';
import { ThemeToggle } from '@/shared/ui/theme-toggle';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const ownerId = await getOwnerId();
  const [profile, subscription, plan, used] = await Promise.all([
    profileService.findUnique(ownerId),
    subscriptionService.findByOwnerId(ownerId),
    getPlanForOwner(ownerId),
    aiUsageService.countForOwnerSince(ownerId, startOfCurrentMonth()),
  ]);

  return (
    <AppPageLayout eyebrow="Account" title="Settings">
      <VStack gap={8}>
        <VStack gap={3}>
          <SectionLabel>Appearance</SectionLabel>
          <ThemeToggle />
        </VStack>

        {profile ? (
          <JobPreferencesForm preferences={profile} />
        ) : (
          <VStack gap={3}>
            <SectionLabel>Job preferences</SectionLabel>
            <EmptyState
              message="Upload your CV on the Profile page to set job preferences."
              className="px-0 py-4"
            />
          </VStack>
        )}

        <BillingPanel subscription={subscription} />

        <UsageMeter used={used} limit={plan.aiActionsPerMonth} />

        <DangerZone />
      </VStack>
    </AppPageLayout>
  );
}
