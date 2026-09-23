import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/shared/ui/utils';

const textVariants = cva('', {
  variants: {
    size: {
      // No dedicated micro step exists in the gapped scale below body-sm;
      // text-label (11px) is reserved for the Label primitive's mono/
      // uppercase meta role, so xs keeps Tailwind's default 12px rather
      // than borrowing that token for plain sans microcopy.
      xs: 'text-xs',
      sm: 'text-body-sm',
      base: 'text-body',
      lg: 'text-body-lg',
    },
    weight: {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
    },
    color: {
      default: 'text-foreground',
      muted: 'text-muted-foreground',
      warning: 'text-warning',
      destructive: 'text-destructive',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    },
  },
  defaultVariants: {
    size: 'sm',
    weight: 'normal',
    color: 'default',
  },
});

interface TextProps
  extends
    Omit<React.ComponentProps<'p'>, 'color'>,
    VariantProps<typeof textVariants> {
  as?: 'p' | 'span' | 'div';
}

function Text({
  className,
  as = 'p',
  size,
  weight,
  color,
  align,
  ...props
}: TextProps) {
  const Comp = as as React.ElementType;
  return (
    <Comp
      data-slot="text"
      className={cn(textVariants({ size, weight, color, align }), className)}
      {...props}
    />
  );
}

export { Text, textVariants };
export type { TextProps };
