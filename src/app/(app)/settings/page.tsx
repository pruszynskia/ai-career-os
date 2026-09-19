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
import { Label, Text, VStack } from '@/shared/ui/primitives';

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
          <Label as="span" variant="meta">
            Appearance
          </Label>
          <Text size="sm" color="muted">
            Follows your system&apos;s light/dark preference. A manual toggle is
            coming soon.
          </Text>
        </VStack>

        {profile ? (
          <JobPreferencesForm preferences={profile} />
        ) : (
          <VStack gap={3}>
            <Label as="span" variant="meta">
              Job preferences
            </Label>
            <EmptyState message="Upload your CV on the Profile page to set job preferences." />
          </VStack>
        )}

        <BillingPanel subscription={subscription} />

        <UsageMeter used={used} limit={plan.aiActionsPerMonth} />

        <DangerZone />
      </VStack>
    </AppPageLayout>
  );
}
