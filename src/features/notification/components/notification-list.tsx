import Link from 'next/link';

import type { Notification } from '@/features/notification/types';
import { Badge } from '@/shared/ui/primitives';

function NotificationGroup({
  title,
  notifications,
  badgeVariant,
}: {
  title: string;
  notifications: Notification[];
  badgeVariant: 'destructive' | 'outline';
}) {
  if (notifications.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium text-muted-foreground">{title}</p>
      <ul className="flex flex-col gap-1">
        {notifications.map((notification) => (
          <li key={notification.id}>
            <Link
              href={notification.href}
              className="flex items-start gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
            >
              <Badge variant={badgeVariant} className="mt-0.5 shrink-0">
                {title === 'Action Required' ? '!' : 'i'}
              </Badge>
              <span>{notification.message}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function NotificationList({
  notifications,
}: {
  notifications: Notification[];
}) {
  const actionRequired = notifications.filter(
    (n) => n.category === 'action-required',
  );
  const general = notifications.filter((n) => n.category === 'general');

  if (notifications.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">You&apos;re all caught up.</p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <NotificationGroup
        title="Action Required"
        notifications={actionRequired}
        badgeVariant="destructive"
      />
      <NotificationGroup
        title="General"
        notifications={general}
        badgeVariant="outline"
      />
    </div>
  );
}
