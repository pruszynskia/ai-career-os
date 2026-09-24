import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/shared/ui/utils';

const inputVariants = cva(
  'w-full min-w-0 rounded-lg border border-input bg-background px-2.5 transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-[var(--surface-sunken)] dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
  {
    variants: {
      // Heights from tokens.json's size.control (md/lg/touch = 32/40/48).
      // touch forces 16px text so iOS doesn't auto-zoom on focus.
      size: {
        md: 'h-8 py-1 text-base md:text-sm',
        lg: 'h-10 py-1.5 text-base md:text-sm',
        touch: 'h-12 py-2 text-base',
      },
    },
    defaultVariants: {
      size: 'md',
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
