import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/shared/ui/utils';

const surfaceVariants = cva('text-card-foreground', {
  variants: {
    padding: {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    },
    elevation: {
      // No border, no background, no shadow - separation comes from
      // spacing and type hierarchy, not a box. This is the default because
      // most content does not earn a container.
      flat: '',
      // A single hairline divider for rows/sections in a list - never a
      // full border, never a shadow.
      ruled: 'border-b border-border',
      // Reserved for content that genuinely needs to read as a distinct
      // object (Card). No shadow here - shadow is for true overlays only
      // (dialog/popover/select/toaster).
      raised: 'rounded-lg border border-border bg-card',
    },
  },
  defaultVariants: {
    padding: 'none',
    elevation: 'flat',
  },
});

interface SurfaceProps
  extends React.ComponentProps<'div'>, VariantProps<typeof surfaceVariants> {}

function Surface({ className, padding, elevation, ...props }: SurfaceProps) {
  return (
    <div
      data-slot="surface"
      className={cn(surfaceVariants({ padding, elevation }), className)}
      {...props}
    />
  );
}

export { Surface, surfaceVariants };
export type { SurfaceProps };
