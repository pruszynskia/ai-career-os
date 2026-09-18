export type NotificationCategory = 'general' | 'action-required';

export interface Notification {
  id: string;
  category: NotificationCategory;
  message: string;
  href: string;
  occurredAt: Date;
  // Only the two derived nudges (TASK-086) - every other notification kind
  // resolves itself once its underlying record changes, so it never needs a
  // dismiss action.
  dismissible?: boolean;
}
