import Link from 'next/link';
import { X } from 'lucide-react';

import type { Notification } from '@/features/notification/types';
import { EmptyState } from '@/shared/ui/empty-state';
import { Badge, IconButton } from '@/shared/ui/primitives';

function NotificationGroup({
  title,
  notifications,
  badgeVariant,
  onDismiss,
}: {
  title: string;
  notifications: Notification[];
  badgeVariant: 'destructive' | 'outline';
  onDismiss?: (id: string) => void;
}) {
  if (notifications.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium text-muted-foreground">{title}</p>
      <ul className="flex flex-col gap-1">
        {notifications.map((notification) => (
          <li key={notification.id} className="flex items-start gap-1">
            <Link
              href={notification.href}
              className="flex flex-1 items-start gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
            >
              <Badge variant={badgeVariant} className="mt-0.5 shrink-0">
                {title === 'Action Required' ? '!' : 'i'}
              </Badge>
              <span>{notification.message}</span>
            </Link>
            {notification.dismissible && onDismiss && (
              <IconButton
                variant="quiet"
                size="sm"
                aria-label="Dismiss"
                className="mt-1 shrink-0"
                onClick={() => onDismiss(notification.id)}
              >
                <X />
              </IconButton>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function NotificationList({
  notifications,
  onDismiss,
}: {
  notifications: Notification[];
  onDismiss?: (id: string) => void;
}) {
  const actionRequired = notifications.filter(
    (n) => n.category === 'action-required',
  );
  const general = notifications.filter((n) => n.category === 'general');

  if (notifications.length === 0) {
    return (
      <EmptyState message="You're all caught up." className="px-2 py-6" />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <NotificationGroup
        title="Action Required"
        notifications={actionRequired}
        badgeVariant="destructive"
        onDismiss={onDismiss}
      />
      <NotificationGroup
        title="General"
        notifications={general}
        badgeVariant="outline"
        onDismiss={onDismiss}
      />
    </div>
  );
}
