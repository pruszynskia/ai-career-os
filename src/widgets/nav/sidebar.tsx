'use client';

import { useState } from 'react';
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
  Search,
  Settings,
  UserCircle,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { IconButton, Meter, SectionLabel } from '@/shared/ui/primitives';
import { cn } from '@/shared/ui/utils';
import { signOut } from '@/shared/auth/actions';
import { useUiStore } from '@/shared/store/ui-store';
import {
  ACTIVE_APPLICATION_STATUSES,
  APPLICATION_STATUS_LABELS,
  type ApplicationStatus,
} from '@/entities/application/types';
import { StageRing } from '@/entities/application/ui/stage-ring';
import { JumpDialog } from '@/widgets/nav/jump-dialog';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

// Views: the app's primary sections. Offers additionally renders a stage
// sub-nav (below), so it's matched by href rather than folded into a
// second array.
const VIEW_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/offers', label: 'Offers', icon: Briefcase },
  { href: '/documents', label: 'Documents', icon: FileText },
  { href: '/posts', label: 'Posts', icon: Rss },
];

const ACCOUNT_ITEMS: NavItem[] = [
  { href: '/profile', label: 'Profile', icon: UserCircle },
  { href: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  stageCounts: Record<ApplicationStatus, number>;
  usage: { used: number; limit: number; planName: string };
}

function NavLink({
  href,
  label,
  icon: Icon,
  isActive,
  textVisibility,
}: NavItem & { isActive: boolean; textVisibility: string }) {
  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'flex items-center gap-2 rounded-lg border-l-2 py-2 pr-2 pl-1.5 text-sm font-medium transition-colors hover:bg-muted',
        isActive
          ? 'border-primary text-foreground'
          : 'border-transparent text-muted-foreground',
      )}
    >
      <Icon aria-hidden="true" className="size-4 shrink-0" />
      <span className={cn('truncate', textVisibility)}>{label}</span>
    </Link>
  );
}

export function Sidebar({ stageCounts, usage }: SidebarProps) {
  const pathname = usePathname();
  const isSidebarOpen = useUiStore((state) => state.isSidebarOpen);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const hasLimit = usage.limit > 0;
  const [isJumpDialogOpen, setIsJumpDialogOpen] = useState(false);

  // The only viewport rule in this shell (tokens.json's tablet breakpoint,
  // 768-1279): force icon-only regardless of the user's own toggle. Below
  // 768 and at/above 1280 the existing manual isSidebarOpen toggle is the
  // only thing driving width/visibility - see tokens.json's
  // breakpoint.rules and TASK-100's prompt.
  const widthClassName = isSidebarOpen
    ? 'w-[232px] min-[768px]:max-[1279px]:w-14'
    : 'w-14';
  const textVisibility = isSidebarOpen
    ? 'min-[768px]:max-[1279px]:sr-only'
    : 'sr-only';
  const sectionVisibility = isSidebarOpen
    ? 'flex min-[768px]:max-[1279px]:hidden'
    : 'hidden';

  return (
    <nav
      aria-label="Main"
      className={cn(
        // Below md: (768), the mobile shell (MobileHeader/MobileTabBar,
        // TASK-123) replaces the sidebar entirely.
        'hidden h-full flex-col gap-4 border-r border-border bg-sidebar p-2 transition-all md:flex',
        widthClassName,
      )}
    >
      <div className="flex items-center gap-1 px-1">
        <span className={cn('text-sm font-semibold', textVisibility)}>
          Career OS
        </span>
        <div className="grow" />
        <IconButton
          variant="quiet"
          onClick={toggleSidebar}
          aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {isSidebarOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
        </IconButton>
      </div>

      <button
        type="button"
        onClick={() => setIsJumpDialogOpen(true)}
        className={cn(
          'flex h-7 shrink-0 items-center gap-2 rounded-lg border border-[var(--border-default)] px-2 text-xs text-muted-foreground',
          !isSidebarOpen && 'justify-center px-0',
        )}
      >
        <Search aria-hidden="true" className="size-3.5 shrink-0" />
        <span className={cn('truncate', textVisibility)}>
          Search or jump to…
        </span>
      </button>
      <JumpDialog open={isJumpDialogOpen} onOpenChange={setIsJumpDialogOpen} />

      <div className="flex flex-1 flex-col gap-1 overflow-y-auto">
        <SectionLabel
          id="nav-group-views"
          className={cn('px-2', textVisibility)}
        >
          Views
        </SectionLabel>
        <ul
          role="group"
          aria-labelledby="nav-group-views"
          className="flex flex-col gap-1"
        >
          {VIEW_ITEMS.map(({ href, label, icon }) => {
            const isActive =
              pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={href}>
                <NavLink
                  href={href}
                  label={label}
                  icon={icon}
                  isActive={isActive}
                  textVisibility={textVisibility}
                />
                {href === '/offers' && (
                  <ul
                    aria-label="Stages"
                    className={cn(
                      'mt-1 flex-col gap-0.5 pl-[27px]',
                      sectionVisibility,
                    )}
                  >
                    {ACTIVE_APPLICATION_STATUSES.map((status) => (
                      <li key={status}>
                        <Link
                          href="/offers"
                          className="flex items-center gap-2 rounded-lg py-1 pr-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          <StageRing status={status} />
                          <span className="grow truncate">
                            {APPLICATION_STATUS_LABELS[status]}
                          </span>
                          <span className="font-mono tabular-nums">
                            {stageCounts[status] ?? 0}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div className={cn('flex-col gap-1.5 px-2', sectionVisibility)}>
        <span className="truncate text-xs text-muted-foreground">
          {usage.planName} plan ·{' '}
          <span className="font-mono tabular-nums">
            {usage.used} of {hasLimit ? usage.limit : '∞'}
          </span>{' '}
          AI actions
        </span>
        <Meter
          variant="inline"
          value={hasLimit ? Math.min(usage.used, usage.limit) : 1}
          max={hasLimit ? usage.limit : 1}
        />
      </div>

      <ul aria-label="Account" className="flex flex-col gap-1">
        {ACCOUNT_ITEMS.map(({ href, label, icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <NavLink
                href={href}
                label={label}
                icon={icon}
                isActive={isActive}
                textVisibility={textVisibility}
              />
            </li>
          );
        })}
      </ul>

      <form action={signOut}>
        <Button
          type="submit"
          variant="quiet"
          className="w-full justify-start gap-2 text-muted-foreground"
        >
          <LogOut aria-hidden="true" className="size-4 shrink-0" />
          <span className={textVisibility}>Sign out</span>
        </Button>
      </form>
    </nav>
  );
}
