'use client';

import * as React from 'react';
import { ToggleGroup as ToggleGroupPrimitive } from 'radix-ui';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/shared/ui/utils';

// SegmentedControl (DESIGN-SYSTEM \S4.6) - single-select sunken track of
// ToggleGroup items (e.g. theme picker, response-rate grouping). Built on
// radix-ui's ToggleGroup the same way Select.tsx wraps radix-ui's Select -
// Root/Item re-exported with this project's cva + cn conventions.
const segmentedControlVariants = cva(
  'inline-flex w-fit items-center rounded-[8px] border border-border bg-[var(--surface-sunken)] p-0.5',
  {
    variants: {
      size: {
        sm: 'h-7',
        md: 'h-8',
      },
    },
    defaultVariants: {
      size: 'sm',
    },
  },
);

interface SegmentedControlProps
  extends
    Omit<
      React.ComponentProps<typeof ToggleGroupPrimitive.Root>,
      'type' | 'value' | 'onValueChange' | 'defaultValue'
    >,
    VariantProps<typeof segmentedControlVariants> {
  value: string;
  onValueChange: (value: string) => void;
}

function SegmentedControl({
  className,
  size = 'sm',
  value,
  onValueChange,
  ...props
}: SegmentedControlProps) {
  return (
    <ToggleGroupPrimitive.Root
      type="single"
      data-slot="segmented-control"
      data-size={size}
      value={value}
      // Radix's single ToggleGroup allows deselecting the pressed item back
      // to "" - a segmented control always keeps exactly one item selected,
      // so empty transitions are dropped.
      onValueChange={(next) => {
        if (next) onValueChange(next);
      }}
      className={cn(segmentedControlVariants({ size }), className)}
      {...props}
    />
  );
}

// Item height is derived from the track's own `data-size` (set on Root)
// via an ancestor attribute selector, so it always matches the track it's
// rendered in without callers having to pass `size` twice. Track heights
// come straight from tokens.json's control-height table (sm 28 / md 32);
// item height is that track height minus the track's 1px border and 0.5
// (2px) padding on each side, so the item fills the padded track exactly
// instead of overflowing it: sm 28-2*1-2*2=22, md 32-2*1-2*2=26.
const segmentedControlItemVariants =
  'inline-flex h-[22px] shrink-0 items-center justify-center gap-1 rounded-[6px] px-3 text-[12.5px] font-medium whitespace-nowrap text-muted-foreground outline-none transition-colors select-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:border data-[state=on]:border-[var(--border-default)] data-[state=on]:bg-popover data-[state=on]:text-foreground [[data-size=md]_&]:h-[26px] [&_[data-slot=segmented-control-count]]:text-muted-foreground [&_[data-slot=segmented-control-count]]:tabular-nums';

type SegmentedControlItemProps = React.ComponentProps<
  typeof ToggleGroupPrimitive.Item
>;

function SegmentedControlItem({
  className,
  ...props
}: SegmentedControlItemProps) {
  return (
    <ToggleGroupPrimitive.Item
      data-slot="segmented-control-item"
      className={cn(segmentedControlItemVariants, className)}
      {...props}
    />
  );
}

export { SegmentedControl, SegmentedControlItem };
export type { SegmentedControlProps, SegmentedControlItemProps };
