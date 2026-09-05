import {
  aiUsageService,
  startOfCurrentMonth,
} from '@/entities/ai-usage/service';
import { subscriptionService } from '@/entities/subscription/service';
import { BillingPanel } from '@/features/billing/components/billing-panel';
import { UsageMeter } from '@/features/billing/components/usage-meter';
import { getOwnerId } from '@/shared/auth/session';
import { getPlanForOwner } from '@/shared/billing/entitlements';
import { AppPageLayout } from '@/shared/layouts';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const ownerId = await getOwnerId();
  const [subscription, plan, used] = await Promise.all([
    subscriptionService.findByOwnerId(ownerId),
    getPlanForOwner(ownerId),
    aiUsageService.countForOwnerSince(ownerId, startOfCurrentMonth()),
  ]);

  return (
    <AppPageLayout title="Settings">
      <BillingPanel subscription={subscription} />
      <UsageMeter used={used} limit={plan.aiActionsPerMonth} />
    </AppPageLayout>
  );
}
