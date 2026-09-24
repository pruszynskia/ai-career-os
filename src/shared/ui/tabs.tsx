'use client';

import * as React from 'react';
import { Tabs as TabsPrimitive } from 'radix-ui';

import { cn } from '@/shared/ui/utils';

// Tabs (DESIGN-SYSTEM \S4.7) - underlined row of TabsTrigger over a
// TabsContent panel. Built on radix-ui's Tabs the same way Select.tsx wraps
// radix-ui's Select - primitives re-exported unmodified so keyboard
// navigation (arrow keys, Home/End) comes straight from radix-ui.
function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn('flex flex-col gap-4', className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        // tokens.json's breakpoint table treats <768 (max-md) as mobile,
        // not <640 (max-sm).
        'flex h-10 items-center gap-[22px] overflow-x-auto overflow-y-hidden border-b border-border max-md:h-11',
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        'inline-flex h-full shrink-0 -mb-px items-center gap-1.5 border-b-2 border-transparent text-body-sm font-medium whitespace-nowrap text-muted-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-primary data-[state=active]:text-foreground [&_[data-slot=tabs-count]]:text-muted-foreground [&_[data-slot=tabs-count]]:tabular-nums',
        className,
      )}
      {...props}
    >
      {children}
    </TabsPrimitive.Trigger>
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn('outline-none', className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
