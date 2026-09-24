import Link from 'next/link';
import { X } from 'lucide-react';

import type { Notification } from '@/features/notification/types';
import { EmptyState } from '@/shared/ui/empty-state';
import { IconButton } from '@/shared/ui/primitives';
import { cn } from '@/shared/ui/utils';

function NotificationRow({
  notification,
  onDismiss,
}: {
  notification: Notification;
  onDismiss?: (id: string) => void;
}) {
  return (
    <div className="flex items-start gap-2.5 border-b border-border px-3.5 py-2.5 last:border-b-0">
      <span
        aria-hidden="true"
        className={cn(
          'mt-1.5 size-[7px] shrink-0 rounded-full',
          notification.category === 'action-required' && 'bg-warning',
        )}
      />
      <Link
        href={notification.href}
        className="min-w-0 flex-1 text-body-sm hover:underline"
      >
        {notification.message}
      </Link>
      {notification.dismissible && onDismiss && (
        <IconButton
          variant="quiet"
          size="sm"
          aria-label="Dismiss"
          className="-mt-0.5 shrink-0"
          onClick={() => onDismiss(notification.id)}
        >
          <X />
        </IconButton>
      )}
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
  if (notifications.length === 0) {
    return (
      <EmptyState message="You're all caught up." className="px-3.5 py-6" />
    );
  }

  // Action-required rows lead, same order the mockup and the trigger's
  // count already imply - no separate section headers, the dot carries
  // the category now.
  const ordered = [
    ...notifications.filter((n) => n.category === 'action-required'),
    ...notifications.filter((n) => n.category === 'general'),
  ];

  return (
    <div className="flex flex-col">
      {ordered.map((notification) => (
        <NotificationRow
          key={notification.id}
          notification={notification}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
}
