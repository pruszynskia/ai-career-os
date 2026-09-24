'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/shared/ui/utils';

const textareaVariants = cva(
  'w-full rounded-lg border border-input bg-background px-2.5 transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-[var(--surface-sunken)] dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
  {
    variants: {
      // Heights from tokens.json's size.control (md/lg/touch = 32/40/48).
      // touch forces 16px text so iOS doesn't auto-zoom on focus.
      size: {
        md: 'min-h-20 py-1 text-sm',
        lg: 'min-h-24 py-1.5 text-sm',
        touch: 'min-h-28 py-2.5 text-base',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

function Textarea({
  className,
  size,
  maxLength,
  value,
  defaultValue,
  onChange,
  'aria-describedby': ariaDescribedBy,
  ...props
}: React.ComponentProps<'textarea'> & VariantProps<typeof textareaVariants>) {
  const [uncontrolledCount, setUncontrolledCount] = React.useState(() =>
    typeof defaultValue === 'string' ? defaultValue.length : 0,
  );
  const count = typeof value === 'string' ? value.length : uncontrolledCount;
  const countId = React.useId();

  const textarea = (
    <textarea
      data-slot="textarea"
      className={cn(textareaVariants({ size }), className)}
      maxLength={maxLength}
      value={value}
      defaultValue={defaultValue}
      aria-describedby={
        maxLength
          ? [countId, ariaDescribedBy].filter(Boolean).join(' ')
          : ariaDescribedBy
      }
      onChange={(event) => {
        setUncontrolledCount(event.target.value.length);
        onChange?.(event);
      }}
      {...props}
    />
  );

  if (!maxLength) return textarea;

  return (
    <div className="flex flex-col gap-1">
      {textarea}
      <span
        id={countId}
        className="self-end text-xs text-muted-foreground tabular-nums"
      >
        {count}/{maxLength}
      </span>
    </div>
  );
}

export { Textarea };
