import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/shared/ui/utils';

const surfaceVariants = cva(
  'rounded-xl bg-card text-card-foreground ring-1 ring-foreground/10',
  {
    variants: {
      padding: {
        none: '',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
      },
      elevation: {
        none: '',
        sm: 'shadow-sm',
        md: 'shadow-md',
      },
    },
    defaultVariants: {
      padding: 'none',
      elevation: 'none',
    },
  },
);

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
