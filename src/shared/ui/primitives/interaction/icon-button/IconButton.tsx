import * as React from 'react';

import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/ui/utils';

// Square sizes from tokens.json's size.iconButton (28/32/44) with icon glyphs
// at 14/16/20 per TASK-092's IconButton spec. These deliberately differ from
// size.icon (13/15/...), which is the inline-with-text scale Button uses next
// to a label; a lone glyph in a square target reads one step larger.
// IconButton owns this scale - Button's size prop only carries text sizes.
const SIZE_CLASSNAME: Record<'sm' | 'md' | 'touch', string> = {
  sm: "size-7 [&_svg:not([class*='size-'])]:size-3.5",
  md: "size-8 [&_svg:not([class*='size-'])]:size-4",
  touch: "size-11 [&_svg:not([class*='size-'])]:size-5",
};

// 6px dot, inset 6px from the top-right corner of the canvas, ringed 2px in
// the button's own background so it reads as cut out of the icon rather
// than floating on top of it (DESIGN-SYSTEM \S4.2). No live consumer yet -
// the notification bell that renders this lands in TASK-102.
const WARNING_DOT_CLASSNAME =
  'pointer-events-none absolute top-1.5 right-1.5 size-1.5 rounded-full bg-warning ring-2 ring-background';

interface IconButtonProps extends Omit<
  React.ComponentProps<typeof Button>,
  'size'
> {
  size?: 'sm' | 'md' | 'touch';
  'aria-label': string;
  /** Renders a 6px warning dot inset in the button's top-right corner. */
  warningDot?: boolean;
}

function IconButton({
  size = 'sm',
  warningDot = false,
  className,
  children,
  ...props
}: IconButtonProps) {
  return (
    <Button
      // null opts out of Button's text size scale entirely.
      size={null}
      className={cn(SIZE_CLASSNAME[size], warningDot && 'relative', className)}
      {...props}
    >
      {warningDot ? (
        <>
          {children}
          <span
            aria-hidden="true"
            data-slot="warning-dot"
            className={WARNING_DOT_CLASSNAME}
          />
        </>
      ) : (
        children
      )}
    </Button>
  );
}

export { IconButton };
export type { IconButtonProps };
