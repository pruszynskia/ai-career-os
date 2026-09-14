import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/shared/ui/utils';

const inputVariants = cva(
  'w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
  {
    variants: {
      // Dense (28px) is the in-app default; comfortable (32px, the old
      // default) is reserved for primary actions.
      size: {
        default: 'h-7 py-0.5',
        comfortable: 'h-8 py-1',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);

function Input({
  className,
  type,
  size,
  ...props
}: Omit<React.ComponentProps<'input'>, 'size'> &
  VariantProps<typeof inputVariants>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(inputVariants({ size }), className)}
      {...props}
    />
  );
}

export { Input };
