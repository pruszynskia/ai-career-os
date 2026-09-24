'use client';

import { useEffect, useSyncExternalStore } from 'react';

import type { Notification } from '@/features/notification/types';

// Dismissal has nowhere to live server-side without a new table or column
// (TASK-086 explicitly rules out a notifications table, and every nudge's
// underlying row already has a fixed shape) - localStorage is enough to
// satisfy "does not reappear after a refresh" for a single-user tool.
// ponytail: browser-local, not per-account - move to a persisted column if
// this ever needs to survive a cleared profile or a second device.
//
// Shared between the notification popover and the dashboard's Needs
// attention section (TASK-104) so a dismissal in either place hides that
// nudge everywhere.
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

export function dismissNotification(id: string): void {
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

export function useDismissedNotifications(notifications: Notification[]): {
  visible: Notification[];
  dismiss: (id: string) => void;
} {
  const dismissed = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    prune(new Set(notifications.map((n) => n.id)));
  }, [notifications]);

  return {
    visible: notifications.filter((n) => !dismissed.has(n.id)),
    dismiss: dismissNotification,
  };
}
