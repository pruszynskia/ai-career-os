'use client';

import { useEffect, useSyncExternalStore } from 'react';
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

// Dismissal has nowhere to live server-side without a new table or column
// (TASK-086 explicitly rules out a notifications table, and every nudge's
// underlying row already has a fixed shape) - localStorage is enough to
// satisfy "does not reappear after a refresh" for a single-user tool.
// ponytail: browser-local, not per-account - move to a persisted column if
// this ever needs to survive a cleared profile or a second device.
//
// useSyncExternalStore, not useState+useEffect: localStorage differs
// between server (nothing dismissed yet) and client, which is exactly the
// case it exists for - a state-in-effect sync here would cascade a render
// instead.
const DISMISSED_KEY = 'ai-career-os:dismissed-notifications';
const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cachedSet = new Set<string>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): Set<string> {
  const raw = window.localStorage.getItem(DISMISSED_KEY);
  if (raw === cachedRaw) return cachedSet;
  cachedRaw = raw;
  try {
    cachedSet = new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    cachedSet = new Set();
  }
  return cachedSet;
}

function getServerSnapshot(): Set<string> {
  return cachedSet;
}

function dismiss(id: string): void {
  const next = new Set(getSnapshot()).add(id);
  cachedRaw = JSON.stringify(Array.from(next));
  cachedSet = next;
  window.localStorage.setItem(DISMISSED_KEY, cachedRaw);
  listeners.forEach((listener) => listener());
}

// Nudge ids are occurrence-bucketed (derive-nudges.ts), so a dismissed id
// naturally stops matching any current notification once that occurrence
// passes - drop those here rather than let the set grow forever.
function prune(liveIds: Set<string>): void {
  const current = getSnapshot();
  const next = new Set([...current].filter((id) => liveIds.has(id)));
  if (next.size === current.size) return;
  cachedRaw = JSON.stringify(Array.from(next));
  cachedSet = next;
  window.localStorage.setItem(DISMISSED_KEY, cachedRaw);
  listeners.forEach((listener) => listener());
}

export function NotificationCenter({
  notifications,
}: {
  notifications: Notification[];
}) {
  const dismissed = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    prune(new Set(notifications.map((n) => n.id)));
  }, [notifications]);

  const visible = notifications.filter((n) => !dismissed.has(n.id));
  const count = visible.filter((n) => n.category === 'action-required').length;

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
        <NotificationList notifications={visible} onDismiss={dismiss} />
      </PopoverContent>
    </Popover>
  );
}
