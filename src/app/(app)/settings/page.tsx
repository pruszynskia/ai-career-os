import { subscriptionService } from '@/entities/subscription/service';
import { BillingPanel } from '@/features/billing/components/billing-panel';
import { getOwnerId } from '@/shared/auth/session';
import { AppPageLayout } from '@/shared/layouts';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const ownerId = await getOwnerId();
  const subscription = await subscriptionService.findByOwnerId(ownerId);

  return (
    <AppPageLayout title="Settings">
      <BillingPanel subscription={subscription} />
    </AppPageLayout>
  );
}
