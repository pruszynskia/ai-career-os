'use client';

import { NotificationList } from '@/features/notification/components/notification-list';
import { useDismissedNotifications } from '@/features/notification/hooks/use-dismissed-notifications';
import type { Notification } from '@/features/notification/types';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

// Client component (not the server-rendered nudges list directly) so a
// dismiss here shares the same localStorage set the notification popover
// uses (use-dismissed-notifications.ts) - a nudge dismissed in one place
// stays hidden in the other.
export function NeedsAttentionCard({
  notifications,
}: {
  notifications: Notification[];
}) {
  const { visible, dismiss } = useDismissedNotifications(notifications);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Needs attention</CardTitle>
        {visible.length > 0 && (
          <CardAction className="text-sm font-medium text-warning">
            {visible.length}
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="px-0 pt-0 pb-0">
        <NotificationList notifications={visible} onDismiss={dismiss} />
      </CardContent>
    </Card>
  );
}
