'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, useTheme } from 'next-themes';
import { Toaster } from 'sonner';
import { CircleAlert, CircleCheck, Clock } from 'lucide-react';

// DESIGN-SYSTEM \S5 toast row: success = accent check, error = danger
// alert, warning = warning clock, info = none. sonner falls back to its own
// built-in icon (getAsset()) for any type missing from this map, so 'info'
// must be set to null explicitly to suppress it - omitting the key entirely
// would still render sonner's default info icon.
const TOAST_ICONS = {
  success: <CircleCheck size={15} className="text-success" />,
  error: <CircleAlert size={15} className="text-destructive" />,
  warning: <Clock size={15} className="text-warning" />,
  info: null,
};

function ThemedToaster() {
  // sonner defaults to theme="light" if not told otherwise, which would
  // render a white toast card on the (now default) dark UI.
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      // Bottom-right; sonner's own CSS already collapses left/right/center
      // to a full-width edge-to-edge toast under 600px (see
      // node_modules/sonner/dist/styles.css's max-width:600px block), which
      // reads as bottom-centre on mobile without any extra responsive logic
      // here.
      position="bottom-right"
      theme={resolvedTheme as 'light' | 'dark' | undefined}
      icons={TOAST_ICONS}
      toastOptions={{
        // Spec asks for error toasts at 6s vs. the 4s default; sonner only
        // exposes a single duration per Toaster/toastOptions, not per type,
        // so that split would mean passing { duration: 6000 } at each of
        // the ~30 toast.error() call sites - out of this restyle's scope.
        duration: 4000,
        classNames: {
          toast:
            '!rounded-[8px] !border !border-[var(--border-default)] !bg-popover !text-popover-foreground !shadow-[var(--shadow-overlay)] !min-h-10 !py-0 !pr-2 !pl-3.5 !text-body-sm',
        },
      }}
    />
  );
}

export function Providers({
  children,
  nonce,
}: {
  children: React.ReactNode;
  nonce: string | undefined;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    // attribute="class" (not data-theme) because globals.css declares
    // @custom-variant dark (&:is(.dark *)) and every dark: utility in the
    // app depends on that class selector. nonce lets the anti-flash inline
    // script this injects run under the CSP from src/proxy.ts, which binds
    // script-src to a per-request nonce in production.
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      nonce={nonce}
    >
      <QueryClientProvider client={queryClient}>
        {children}
        <ThemedToaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
