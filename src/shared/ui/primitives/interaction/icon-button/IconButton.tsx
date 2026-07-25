import * as React from 'react';

import { Button, buttonVariants } from '@/shared/ui/button';
import type { VariantProps } from 'class-variance-authority';

const SIZE_MAP: Record<
  'xs' | 'sm' | 'default' | 'lg',
  NonNullable<VariantProps<typeof buttonVariants>['size']>
> = {
  xs: 'icon-xs',
  sm: 'icon-sm',
  default: 'icon',
  lg: 'icon-lg',
};

interface IconButtonProps extends Omit<
  React.ComponentProps<typeof Button>,
  'size'
> {
  size?: 'xs' | 'sm' | 'default' | 'lg';
  'aria-label': string;
}

function IconButton({ size = 'default', ...props }: IconButtonProps) {
  return <Button size={SIZE_MAP[size]} {...props} />;
}

export { IconButton };
export type { IconButtonProps };
