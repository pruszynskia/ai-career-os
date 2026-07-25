import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/shared/ui/utils';

const containerVariants = cva('mx-auto w-full px-4', {
  variants: {
    size: {
      sm: 'max-w-screen-sm',
      md: 'max-w-screen-md',
      lg: 'max-w-screen-lg',
      xl: 'max-w-screen-xl',
      full: 'max-w-full',
    },
  },
  defaultVariants: {
    size: 'lg',
  },
});

interface ContainerProps
  extends React.ComponentProps<'div'>, VariantProps<typeof containerVariants> {}

function Container({ className, size, ...props }: ContainerProps) {
  return (
    <div
      data-slot="container"
      className={cn(containerVariants({ size }), className)}
      {...props}
    />
  );
}

export { Container, containerVariants };
export type { ContainerProps };
