import * as React from 'react';

import { Button } from '@/shared/ui/button';
import { Spinner } from '@/shared/ui/primitives';

interface AsyncButtonProps extends React.ComponentProps<typeof Button> {
  /** Whether the async action this button triggers is in flight. */
  pending?: boolean;
  /** Label shown while pending. Falls back to `children` if omitted. */
  pendingLabel?: React.ReactNode;
}

function AsyncButton({
  pending = false,
  pendingLabel,
  children,
  disabled,
  ...props
}: AsyncButtonProps) {
  return (
    <Button disabled={disabled || pending} {...props}>
      {pending && <Spinner size="sm" />}
      {pending ? (pendingLabel ?? children) : children}
    </Button>
  );
}

export { AsyncButton };
export type { AsyncButtonProps };
