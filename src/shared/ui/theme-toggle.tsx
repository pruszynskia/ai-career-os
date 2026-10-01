'use client';

import { useSyncExternalStore } from 'react';
import { MonitorIcon, MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from 'next-themes';

import { SegmentedControl, SegmentedControlItem } from '@/shared/ui/primitives';

const OPTIONS = [
  { value: 'system', label: 'System', icon: MonitorIcon },
  { value: 'light', label: 'Light', icon: SunIcon },
  { value: 'dark', label: 'Dark', icon: MoonIcon },
] as const;

const noopSubscribe = () => () => {};

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  // next-themes only knows the stored preference after mount (it reads
  // localStorage client-side), so rendering `theme`-dependent markup before
  // that would mismatch the server-rendered output and log a hydration
  // warning. useSyncExternalStore, not useState+useEffect, for the same
  // reason as notification-center.tsx: a state-in-effect here would just
  // cascade a render instead of avoiding the mismatch.
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  return (
    <SegmentedControl
      aria-label="Theme"
      value={mounted ? (theme ?? 'system') : 'system'}
      onValueChange={(value) => setTheme(value)}
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => (
        <SegmentedControlItem key={value} value={value} className="gap-1.5">
          <Icon aria-hidden="true" className="size-3.5" />
          {label}
        </SegmentedControlItem>
      ))}
    </SegmentedControl>
  );
}

export { ThemeToggle };
