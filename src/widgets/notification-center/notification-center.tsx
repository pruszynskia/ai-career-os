'use client';

import { Bell } from 'lucide-react';

import { NotificationList } from '@/features/notification/components/notification-list';
import { useDismissedNotifications } from '@/features/notification/hooks/use-dismissed-notifications';
import type { Notification } from '@/features/notification/types';
import {
  IconButton,
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Tag,
} from '@/shared/ui/primitives';

export function NotificationCenter({
  notifications,
}: {
  notifications: Notification[];
}) {
  const { visible, dismiss } = useDismissedNotifications(notifications);
  const count = visible.filter((n) => n.category === 'action-required').length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <IconButton
          variant="quiet"
          warningDot={count > 0}
          aria-label={
            count > 0
              ? `Notifications (${count} require action)`
              : 'Notifications'
          }
        >
          <Bell />
        </IconButton>
      </PopoverTrigger>
      <PopoverContent align="start" size="notifications">
        <PopoverHeader className="justify-between gap-2">
          Notifications
          {count > 0 && (
            <Tag size="sm" className="h-5 border-transparent px-0 text-warning">
              {count} need action
            </Tag>
          )}
        </PopoverHeader>
        <NotificationList notifications={visible} onDismiss={dismiss} />
      </PopoverContent>
    </Popover>
  );
}
