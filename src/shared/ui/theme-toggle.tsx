'use client';

import { useSyncExternalStore } from 'react';
import { MonitorIcon, MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/shared/ui/button';

const OPTIONS = [
  { value: 'dark', label: 'Dark', icon: MoonIcon },
  { value: 'light', label: 'Light', icon: SunIcon },
  { value: 'system', label: 'System', icon: MonitorIcon },
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
    <div
      role="group"
      aria-label="Theme"
      className="inline-flex gap-0.5 rounded-lg border border-border bg-background p-0.5 dark:border-input dark:bg-input/30"
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => (
        <Button
          key={value}
          type="button"
          size="sm"
          variant={mounted && theme === value ? 'primary' : 'quiet'}
          aria-pressed={mounted && theme === value}
          onClick={() => setTheme(value)}
          className="gap-1.5"
        >
          <Icon />
          {label}
        </Button>
      ))}
    </div>
  );
}

export { ThemeToggle };
