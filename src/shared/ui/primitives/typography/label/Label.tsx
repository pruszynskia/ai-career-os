import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/shared/ui/utils';

const labelVariants = cva('', {
  variants: {
    variant: {
      form: 'text-sm font-medium',
      meta: 'text-xs text-muted-foreground',
    },
  },
  defaultVariants: {
    variant: 'form',
  },
});

interface LabelProps
  extends React.ComponentProps<'label'>, VariantProps<typeof labelVariants> {
  as?: 'label' | 'span';
}

function Label({ className, variant, as = 'label', ...props }: LabelProps) {
  const Comp = as as React.ElementType;
  return (
    <Comp
      data-slot="label"
      className={cn(labelVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Label, labelVariants };
export type { LabelProps };
