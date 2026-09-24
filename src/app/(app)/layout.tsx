import {
  aiUsageService,
  startOfCurrentMonth,
} from '@/entities/ai-usage/service';
import { getStageCounts } from '@/features/nav/services/get-stage-counts.service';
import { getNotifications } from '@/features/notification/services/get-notifications.service';
import { getOwnerId } from '@/shared/auth/session';
import { getPlanForOwner } from '@/shared/billing/entitlements';
import { Screen } from '@/shared/ui/primitives';
import { Sidebar } from '@/widgets/nav/sidebar';
import { TopBar } from '@/widgets/nav/top-bar';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ownerId = await getOwnerId();
  const [notifications, stageCounts, plan, used] = await Promise.all([
    getNotifications(ownerId),
    getStageCounts(),
    getPlanForOwner(ownerId),
    aiUsageService.countForOwnerSince(ownerId, startOfCurrentMonth()),
  ]);

  return (
    <div className="flex h-screen">
      <Sidebar
        stageCounts={stageCounts}
        usage={{ used, limit: plan.aiActionsPerMonth, planName: plan.name }}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar notifications={notifications} />
        <Screen>{children}</Screen>
      </div>
    </div>
  );
}
