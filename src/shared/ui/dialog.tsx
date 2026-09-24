'use client';

import * as React from 'react';
import { Dialog as DialogPrimitive } from 'radix-ui';

import { cn } from '@/shared/ui/utils';
import { Button } from '@/shared/ui/button';
import { IconButton } from '@/shared/ui/primitives';
import { XIcon } from 'lucide-react';

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

// DESIGN-SYSTEM \S5 overlay.scrim, via the --scrim token (globals.css).
function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        'fixed inset-0 isolate z-50 bg-[var(--scrim)] duration-[var(--dur)] ease-[var(--ease)] data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0',
        className,
      )}
      {...props}
    />
  );
}

// Widths from tokens.json's overlay table: sm 440 (confirm), md 520 (forms),
// lg 640 (editors), always capped at 100vw-32 - min() keeps that cap active
// even once the sm: breakpoint's own max-w takes over from the mobile
// calc(100%-2rem) default.
const DIALOG_SIZE_CLASSNAME = {
  sm: 'sm:max-w-[min(440px,calc(100vw-2rem))]',
  md: 'sm:max-w-[min(520px,calc(100vw-2rem))]',
  lg: 'sm:max-w-[min(640px,calc(100vw-2rem))]',
} as const;

function DialogContent({
  className,
  children,
  showCloseButton = true,
  size = 'md',
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean;
  /** Panel width per the overlay table - sm 440 / md 520 / lg 640. */
  size?: keyof typeof DIALOG_SIZE_CLASSNAME;
}) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          // Mobile: full-width sheet pinned to the bottom, radius top-only.
          // sm and up: centered panel, radius all corners, width variant.
          // px-5/pt-5/pb-5/gap-3.5 give the header and any bare body
          // children (no DialogBody wrapper exists - see the header/footer
          // comment below) the 20-side / ~16-vertical rhythm from the
          // overlay table; DialogFooter breaks out of pb-5 with its own
          // border and padding, the same way it did pre-restyle.
          // max-h-[85vh]/overflow-y-auto on mobile so long content scrolls
          // inside the sheet instead of overflowing the viewport; sm: and up
          // drop both since the centered panel doesn't need the cap.
          'fixed inset-x-0 bottom-0 z-50 grid max-h-[85vh] w-full gap-3.5 overflow-y-auto rounded-t-[12px] border-t border-border bg-popover px-5 pt-5 pb-5 text-popover-foreground shadow-[var(--shadow-overlay)] duration-[var(--dur)] ease-[var(--ease)] outline-none data-open:animate-in data-open:fade-in-0 data-open:slide-in-from-bottom-2 data-closed:animate-out data-closed:fade-out-0 data-closed:slide-out-to-bottom-2 sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:mx-0 sm:max-h-[85vh] sm:w-full sm:max-w-[calc(100vw-2rem)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[12px] sm:border sm:data-open:slide-in-from-bottom-1 sm:data-closed:slide-out-to-bottom-1',
          DIALOG_SIZE_CLASSNAME[size],
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close data-slot="dialog-close" asChild>
            <IconButton
              variant="quiet"
              size="sm"
              className="absolute top-4 right-4"
              aria-label="Close"
            >
              {/* size-[13px] (not the size prop) so it wins over IconButton
                  sm's own [&_svg:not([class*='size-'])] default - that
                  selector only skips svgs that already carry a size-*
                  class, and lucide's size prop sets a width/height
                  attribute, not a class. */}
              <XIcon className="size-[13px]" />
            </IconButton>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  // Horizontal/top padding come from DialogContent's own px-5/pt-5 (header
  // padding is "20 20 0" per the overlay table - no bottom padding of its
  // own); pr-7 just clears the absolutely-positioned close button.
  return (
    <div
      data-slot="dialog-header"
      className={cn('flex flex-col gap-1 pr-7', className)}
      {...props}
    />
  );
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  showCloseButton?: boolean;
}) {
  // Breaks out of DialogContent's px-5/pb-5 (-mx-5 -mb-5) to own its
  // border-t and exact 14/20 padding, same pattern the pre-restyle footer
  // used to add its own background/radius.
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        '-mx-5 -mb-5 flex flex-col-reverse gap-2 border-t border-border px-5 py-3.5 sm:flex-row sm:justify-end',
        className,
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <Button variant="quiet">Close</Button>
        </DialogPrimitive.Close>
      )}
    </div>
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  // Explicit font-sans, not an oversight: same as CardTitle in card.tsx -
  // Geist Sans is the only face now (Midnight Mint, ADR-023), so this just
  // matches Heading.tsx's font family rather than a size-gated display face.
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        'font-sans text-body-lg leading-none font-semibold tracking-[-0.01em]',
        className,
      )}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        'text-body-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground',
        className,
      )}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
