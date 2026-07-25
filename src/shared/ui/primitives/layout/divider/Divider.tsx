import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/shared/ui/utils';

const dividerVariants = cva('border-border', {
  variants: {
    orientation: {
      horizontal: 'w-full border-t',
      vertical: 'h-full border-l',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
  },
});

interface DividerProps
  extends React.ComponentProps<'div'>, VariantProps<typeof dividerVariants> {}

function Divider({ className, orientation, ...props }: DividerProps) {
  return (
    <div
      data-slot="divider"
      role="separator"
      aria-orientation={orientation ?? 'horizontal'}
      className={cn(dividerVariants({ orientation }), className)}
      {...props}
    />
  );
}

export { Divider, dividerVariants };
export type { DividerProps };
