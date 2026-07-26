export type NotificationCategory = 'general' | 'action-required';

export interface Notification {
  id: string;
  category: NotificationCategory;
  message: string;
  href: string;
  occurredAt: Date;
}
