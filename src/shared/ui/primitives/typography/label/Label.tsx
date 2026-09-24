import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/shared/ui/utils';

const labelVariants = cva('', {
  variants: {
    // The "meta" variant is retired (DESIGN-SYSTEM.md \S4.4) - use SectionLabel.
    variant: {
      form: 'text-xs font-medium text-[var(--foreground-secondary)]',
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
