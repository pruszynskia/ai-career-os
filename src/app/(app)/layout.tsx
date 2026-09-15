import { Sidebar } from '@/widgets/nav/sidebar';
import { Screen } from '@/shared/ui/primitives';
import { getNotifications } from '@/features/notification/services/get-notifications.service';
import { getOwnerId } from '@/shared/auth/session';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ownerId = await getOwnerId();
  const notifications = await getNotifications(ownerId);

  return (
    <div className="flex h-screen">
      <Sidebar notifications={notifications} />
      <Screen>{children}</Screen>
    </div>
  );
}
