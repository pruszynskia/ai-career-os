'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/shared/ui/utils';

const avatarVariants = cva(
  'relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-muted-foreground',
  {
    variants: {
      size: {
        sm: 'size-6 text-xs',
        md: 'size-8 text-sm',
        lg: 'size-10 text-base',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

interface AvatarProps
  extends
    Omit<React.ComponentProps<'div'>, 'children'>,
    VariantProps<typeof avatarVariants> {
  src?: string;
  alt?: string;
  fallback?: string;
}

function Avatar({
  className,
  size,
  src,
  alt,
  fallback,
  ...props
}: AvatarProps) {
  const [imageFailed, setImageFailed] = React.useState(false);

  return (
    <div
      data-slot="avatar"
      className={cn(avatarVariants({ size }), className)}
      {...props}
    >
      {src && !imageFailed ? (
        <img
          src={src}
          alt={alt ?? ''}
          className="size-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span aria-hidden="true">{fallback}</span>
      )}
    </div>
  );
}

export { Avatar, avatarVariants };
export type { AvatarProps };
