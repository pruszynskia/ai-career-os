'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

import { NotificationCenter } from '@/widgets/notification-center/notification-center';
import type { Notification } from '@/features/notification/types';

// Same first-path-segment targets as sidebar.tsx's VIEW_ITEMS/ACCOUNT_ITEMS -
// there is no route-metadata source to derive this from yet, so it stays a
// small static map rather than a shared lookup with the nav items (which
// carry an icon, not a breadcrumb-appropriate label).
const BREADCRUMB_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  offers: 'Offers',
  documents: 'Documents',
  posts: 'Posts',
  profile: 'Profile',
  settings: 'Settings',
  onboarding: 'Onboarding',
};

function breadcrumbLabel(pathname: string): string {
  const segment = pathname.split('/').filter(Boolean)[0];
  if (!segment) return 'Home';
  return (
    BREADCRUMB_LABELS[segment] ??
    segment.charAt(0).toUpperCase() + segment.slice(1)
  );
}

interface TopBarProps {
  notifications: Notification[];
  /** Primary action slot - structural only (TASK-100); empty unless a page passes one. */
  children?: ReactNode;
}

export function TopBar({ notifications, children }: TopBarProps) {
  const pathname = usePathname();

  return (
    <header className="flex h-[52px] shrink-0 items-center gap-2.5 border-b border-border px-4">
      <nav aria-label="Breadcrumb" className="text-sm">
        <span className="font-semibold text-foreground">
          {breadcrumbLabel(pathname)}
        </span>
      </nav>
      <div className="grow" />
      <NotificationCenter notifications={notifications} />
      {children}
    </header>
  );
}
