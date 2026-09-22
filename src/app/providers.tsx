'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, useTheme } from 'next-themes';
import { Toaster } from 'sonner';

function ThemedToaster() {
  // sonner defaults to theme="light" if not told otherwise, which would
  // render a white toast card on the (now default) dark UI.
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      richColors
      position="top-right"
      theme={resolvedTheme as 'light' | 'dark' | undefined}
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
