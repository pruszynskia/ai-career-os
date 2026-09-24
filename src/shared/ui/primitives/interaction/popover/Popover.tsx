'use client';

import * as React from 'react';
import { Popover as PopoverPrimitive } from 'radix-ui';

import { cn } from '@/shared/ui/utils';

function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverAnchor({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

// 'notifications' is the 380px-wide panel from the overlay table
// (DESIGN-SYSTEM \S5) - pair it with PopoverHeader and PopoverMenuItem's
// warningDot/action props. No trigger wires this in yet (TASK-102 owns
// the notification-center bell); it exists so that task doesn't need a
// second restyle pass.
const POPOVER_SIZE_CLASSNAME = {
  menu: 'w-72 p-4',
  notifications: 'w-[380px] p-0',
} as const;

function PopoverContent({
  className,
  align = 'center',
  sideOffset = 8,
  size = 'menu',
  menu = false,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content> & {
  size?: keyof typeof POPOVER_SIZE_CLASSNAME;
  /**
   * Set only when every child is a PopoverMenuItem (role="menuitem") that
   * the user navigates with arrow keys - a plain content panel (e.g. the
   * notification list) must NOT get role="menu" without the roving-focus
   * behaviour that role implies.
   */
  menu?: boolean;
}) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        role={menu ? 'menu' : undefined}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'z-50 rounded-[8px] border border-[var(--border-default)] bg-popover text-sm text-popover-foreground shadow-[var(--shadow-overlay)] duration-[var(--dur-fast)] ease-[var(--ease)] outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1',
          POPOVER_SIZE_CLASSNAME[size],
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

// 44px title row for the notifications-panel variant - render as the first
// child of PopoverContent(size="notifications").
function PopoverHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="popover-header"
      className={cn(
        'flex h-11 shrink-0 items-center border-b border-border px-3.5 text-body-sm font-medium',
        className,
      )}
      {...props}
    />
  );
}

// 32px menu/list row shared by both PopoverContent sizes. warningDot renders
// the 7px action-required dot the notifications panel leads each row with;
// action renders a trailing slot (e.g. a dismiss IconButton) for that same
// panel. Plain menu rows use neither.
function PopoverMenuItem({
  className,
  warningDot = false,
  action,
  children,
  onClick,
  onKeyDown,
  ...props
}: Omit<React.ComponentProps<'div'>, 'onClick'> & {
  warningDot?: boolean;
  action?: React.ReactNode;
  onClick?: (
    event: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>,
  ) => void;
}) {
  // A plain <div> (not <button>) because `action` can render its own
  // interactive IconButton (the notifications panel's dismiss control) -
  // nesting a <button> inside a <button> is invalid HTML. role="menuitem" +
  // tabIndex + Enter/Space keep it reachable and activatable from the
  // keyboard instead.
  return (
    <div
      data-slot="popover-menu-item"
      role="menuitem"
      tabIndex={0}
      className={cn(
        'flex h-8 items-center gap-2 rounded-[6px] px-2.5 text-body-sm hover:bg-muted focus-visible:bg-muted focus-visible:outline-none',
        className,
      )}
      onClick={onClick}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        // Ignore keydowns that bubbled up from a nested interactive `action`
        // (e.g. the notifications panel's dismiss IconButton) so that
        // control keeps handling its own Enter/Space activation instead of
        // this row hijacking it.
        if (event.target !== event.currentTarget) return;
        if (event.defaultPrevented) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick?.(event);
          return;
        }
        // Roving focus between sibling menu items, same key set as
        // native <select>/ARIA menu widgets.
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault();
          const items = Array.from(
            event.currentTarget.parentElement?.querySelectorAll<HTMLElement>(
              '[data-slot="popover-menu-item"]',
            ) ?? [],
          );
          const index = items.indexOf(event.currentTarget);
          const next =
            items[
              (index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) %
                items.length
            ];
          next?.focus();
        }
      }}
      {...props}
    >
      {warningDot && (
        <span
          aria-hidden="true"
          data-slot="warning-dot"
          className="size-[7px] shrink-0 rounded-full bg-warning"
        />
      )}
      <span className="flex-1 truncate">{children}</span>
      {action}
    </div>
  );
}

export {
  Popover,
  PopoverTrigger,
  PopoverAnchor,
  PopoverContent,
  PopoverHeader,
  PopoverMenuItem,
};
