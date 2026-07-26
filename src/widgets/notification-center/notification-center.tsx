'use client';

import { Bell } from 'lucide-react';

import { NotificationList } from '@/features/notification/components/notification-list';
import type { Notification } from '@/features/notification/types';
import {
  Badge,
  IconButton,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/primitives';

export function NotificationCenter({
  notifications,
}: {
  notifications: Notification[];
}) {
  const count = notifications.filter(
    (n) => n.category === 'action-required',
  ).length;

  return (
    <Popover>
      <div className="relative">
        <PopoverTrigger asChild>
          <IconButton
            variant="ghost"
            aria-label={
              count > 0
                ? `Notifications (${count} require action)`
                : 'Notifications'
            }
          >
            <Bell />
          </IconButton>
        </PopoverTrigger>
        {count > 0 && (
          <Badge
            aria-hidden="true"
            variant="destructive"
            size="sm"
            className="pointer-events-none absolute -top-1 -right-1 min-w-4 justify-center px-1"
          >
            {count}
          </Badge>
        )}
      </div>
      <PopoverContent align="start">
        <NotificationList notifications={notifications} />
      </PopoverContent>
    </Popover>
  );
}
