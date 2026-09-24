'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Briefcase,
  LayoutDashboard,
  Menu,
  Plus,
  Rss,
  type LucideIcon,
} from 'lucide-react';

import { AddOfferForm } from '@/features/job-offer/components/add-offer-form';
import type { Notification } from '@/features/notification/types';
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetDescription,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetTrigger,
} from '@/shared/ui/bottom-sheet';
import { cn } from '@/shared/ui/utils';
import { NotificationCenter } from '@/widgets/notification-center/notification-center';

interface TabItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

// Same first-path-segment matching as sidebar.tsx/top-bar.tsx - Documents/
// Profile/Settings don't get a dedicated tab per X-m-dashboard.dc.html (only
// 5 slots: Home/Offers/add/Posts/More), so "More" points at Settings for now
// - a dedicated mobile "more" menu is out of this task's scope.
const LEFT_ITEMS: TabItem[] = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/offers', label: 'Offers', icon: Briefcase },
];
const RIGHT_ITEMS: TabItem[] = [
  { href: '/posts', label: 'Posts', icon: Rss },
  { href: '/settings', label: 'More', icon: Menu },
];

const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Home',
  offers: 'Offers',
  documents: 'Documents',
  posts: 'Posts',
  profile: 'Profile',
  settings: 'Settings',
};

function pageTitle(pathname: string): string {
  const segment = pathname.split('/').filter(Boolean)[0];
  if (!segment) return 'Home';
  return (
    PAGE_TITLES[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1)
  );
}

/** 56px mobile header - page title + notifications. Sibling of TopBar, shown max-md: only. */
export function MobileHeader({
  notifications,
}: {
  notifications: Notification[];
}) {
  const pathname = usePathname();

  return (
    <header className="flex h-[56px] shrink-0 items-center gap-2.5 border-b border-border px-4 md:hidden">
      <span className="text-body-lg font-semibold text-foreground">
        {pageTitle(pathname)}
      </span>
      <div className="grow" />
      <NotificationCenter notifications={notifications} />
    </header>
  );
}

function TabLink({
  href,
  label,
  icon: Icon,
  isActive,
}: TabItem & { isActive: boolean }) {
  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium text-muted-foreground',
        isActive && 'text-foreground font-semibold',
      )}
    >
      <Icon aria-hidden="true" className="size-5" />
      {label}
    </Link>
  );
}

/** 76px fixed bottom bar - Home/Offers/add/Posts/More. Shown max-md: only. */
export function MobileTabBar() {
  const pathname = usePathname();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 grid h-[76px] grid-cols-5 items-center gap-1 border-t border-border bg-sidebar px-2 pt-1.5 pb-[18px] md:hidden"
    >
      {LEFT_ITEMS.map((item) => (
        <TabLink key={item.href} {...item} isActive={isActive(item.href)} />
      ))}
      <BottomSheet open={isAddOpen} onOpenChange={setIsAddOpen}>
        <BottomSheetTrigger asChild>
          <button
            type="button"
            aria-label="Add offer"
            className="mx-auto flex h-11 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-[var(--primary-hover)]"
          >
            <Plus aria-hidden="true" className="size-5" />
          </button>
        </BottomSheetTrigger>
        <BottomSheetContent>
          <BottomSheetHeader>
            <BottomSheetTitle>Add offer</BottomSheetTitle>
            <BottomSheetDescription>
              Paste a link to a job posting or its full text.
            </BottomSheetDescription>
          </BottomSheetHeader>
          <AddOfferForm onSuccess={() => setIsAddOpen(false)} />
        </BottomSheetContent>
      </BottomSheet>
      {RIGHT_ITEMS.map((item) => (
        <TabLink key={item.href} {...item} isActive={isActive(item.href)} />
      ))}
    </nav>
  );
}
