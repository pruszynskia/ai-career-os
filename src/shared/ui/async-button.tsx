import * as React from 'react';

import { Button } from '@/shared/ui/button';
import { Spinner } from '@/shared/ui/primitives';
import { cn } from '@/shared/ui/utils';

interface AsyncButtonProps extends React.ComponentProps<typeof Button> {
  /** Whether the async action this button triggers is in flight. */
  pending?: boolean;
  /** Label shown while pending. Falls back to `children` if omitted. */
  pendingLabel?: React.ReactNode;
}

// Both layers share one grid cell, so the button is always as wide as the
// wider of the two; the inactive layer is visibility:hidden (still in flow,
// and aria-hidden so it stays out of the a11y tree). Rest and pending therefore render at the same width
// - no measurement, and it holds even if the button mounts already pending
// (\S4.1's pending-state rule). gap-[inherit] carries Button's per-size gap
// down through the wrapper.
const LAYER_CLASSNAME =
  'col-start-1 row-start-1 inline-flex items-center justify-center gap-[inherit]';

function AsyncButton({
  pending = false,
  pendingLabel,
  children,
  disabled,
  ...props
}: AsyncButtonProps) {
  return (
    <Button {...props} disabled={disabled || pending}>
      <span className="inline-grid gap-[inherit]">
        <span
          aria-hidden={pending || undefined}
          className={cn(LAYER_CLASSNAME, pending && 'invisible')}
        >
          {children}
        </span>
        <span
          aria-hidden={!pending || undefined}
          className={cn(LAYER_CLASSNAME, !pending && 'invisible')}
        >
          <Spinner size="sm" />
          {pendingLabel ?? children}
        </span>
      </span>
    </Button>
  );
}

export { AsyncButton };
export type { AsyncButtonProps };
