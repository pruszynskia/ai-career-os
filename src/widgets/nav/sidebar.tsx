'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Briefcase,
  ClipboardList,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  Rss,
  UserCircle,
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/ui/utils';
import { useUiStore } from '@/shared/store/ui-store';
import type { Notification } from '@/features/notification/types';
import { NotificationCenter } from '@/widgets/notification-center/notification-center';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/offers', label: 'Offers', icon: Briefcase },
  { href: '/applications', label: 'Applications', icon: ClipboardList },
  { href: '/posts', label: 'Posts', icon: Rss },
  { href: '/profile', label: 'Profile', icon: UserCircle },
];

export function Sidebar({
  notifications,
}: {
  notifications: Notification[];
}) {
  const pathname = usePathname();
  const isSidebarOpen = useUiStore((state) => state.isSidebarOpen);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);

  return (
    <nav
      aria-label="Main"
      className={cn(
        'flex h-full flex-col gap-2 border-r border-border bg-card p-2 transition-all',
        isSidebarOpen ? 'w-56' : 'w-14',
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {isSidebarOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
        </Button>
        <NotificationCenter notifications={notifications} />
      </div>
      <ul className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium hover:bg-muted',
                  isActive
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground',
                )}
              >
                <Icon aria-hidden="true" className="size-4 shrink-0" />
                <span className={isSidebarOpen ? undefined : 'sr-only'}>
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
