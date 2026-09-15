'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Briefcase,
  FileText,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Rss,
  Settings,
  UserCircle,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/ui/utils';
import { signOut } from '@/shared/auth/actions';
import { useUiStore } from '@/shared/store/ui-store';
import { Label } from '@/shared/ui/primitives';
import type { Notification } from '@/features/notification/types';
import { NotificationCenter } from '@/widgets/notification-center/notification-center';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

// Grouped, single exported data structure — the grouping is data the shell
// renders, not JSX structure, so a later task (e.g. a command palette) can
// consume the same list.
const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Workspace',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/offers', label: 'Offers', icon: Briefcase },
      { href: '/documents', label: 'Documents', icon: FileText },
      { href: '/posts', label: 'Posts', icon: Rss },
    ],
  },
  {
    label: 'Account',
    items: [
      { href: '/profile', label: 'Profile', icon: UserCircle },
      { href: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export function Sidebar({ notifications }: { notifications: Notification[] }) {
  const pathname = usePathname();
  const isSidebarOpen = useUiStore((state) => state.isSidebarOpen);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);

  return (
    <nav
      aria-label="Main"
      className={cn(
        'flex h-full flex-col gap-4 border-r border-border p-2 transition-all',
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
      <div className="flex flex-1 flex-col gap-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="flex flex-col gap-1">
            <Label
              as="span"
              id={`nav-group-${group.label}`}
              variant="meta"
              className={cn('px-2', isSidebarOpen ? undefined : 'sr-only')}
            >
              {group.label}
            </Label>
            <ul
              role="group"
              aria-labelledby={`nav-group-${group.label}`}
              className="flex flex-col gap-1"
            >
              {group.items.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'flex items-center gap-2 rounded-lg border-l-2 py-2 pr-2 pl-1.5 text-sm font-medium transition-colors hover:bg-muted',
                        isActive
                          ? 'border-accent text-foreground'
                          : 'border-transparent text-muted-foreground',
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
          </div>
        ))}
      </div>
      <form action={signOut} className="mt-auto">
        <Button
          type="submit"
          variant="ghost"
          className="w-full justify-start gap-2 text-muted-foreground"
        >
          <LogOut aria-hidden="true" className="size-4 shrink-0" />
          <span className={isSidebarOpen ? undefined : 'sr-only'}>
            Sign out
          </span>
        </Button>
      </form>
    </nav>
  );
}
