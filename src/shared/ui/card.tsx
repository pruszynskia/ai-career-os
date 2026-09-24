import * as React from 'react';

import { cn } from '@/shared/ui/utils';
import { surfaceVariants } from '@/shared/ui/primitives/surface/surface';

function Card({
  className,
  size = 'default',
  ...props
}: React.ComponentProps<'div'> & { size?: 'default' | 'sm' }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        surfaceVariants({ elevation: 'outlined' }),
        'group/card flex flex-col overflow-hidden text-sm [--card-spacing:--spacing(4)] data-[size=sm]:[--card-spacing:--spacing(3)] *:[img:first-child]:rounded-t-[8px] *:[img:last-child]:rounded-b-[8px]',
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        'group/card-header @container/card-header grid min-h-11 auto-rows-min items-center gap-1 px-(--card-spacing) py-2 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] has-data-[slot=card-description]:items-start [.border-b]:pb-(--card-spacing)',
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  // Explicit font-sans, not an oversight: Geist Sans is the only face now
  // (Midnight Mint, ADR-023 - see Heading.tsx), so this just matches it
  // rather than gating a display face by size.
  return (
    <div
      data-slot="card-title"
      className={cn(
        'font-sans text-body-lg leading-snug font-medium group-data-[size=sm]/card:text-body',
        className,
      )}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-content"
      className={cn(
        'px-(--card-spacing) pt-1 pb-(--card-spacing) first:pt-(--card-spacing)',
        className,
      )}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        'flex items-center rounded-b-lg border-t bg-muted/50 p-(--card-spacing)',
        className,
      )}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
