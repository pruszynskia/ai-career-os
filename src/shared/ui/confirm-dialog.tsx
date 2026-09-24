import * as React from 'react';

import { AsyncButton } from '@/shared/ui/async-button';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';

interface ConfirmDialogProps {
  /** Element that opens the dialog, e.g. a `Button` — rendered via `asChild`. */
  trigger: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  confirmLabel?: React.ReactNode;
  pendingLabel?: React.ReactNode;
  cancelLabel?: React.ReactNode;
  onConfirm: () => void;
  /** Whether the confirm action is in flight. */
  pending?: boolean;
  /** Disables the confirm action, e.g. until a typed confirmation matches. */
  confirmDisabled?: boolean;
  /** Extra content rendered between the description and the footer, e.g. a typed-confirmation input. */
  children?: React.ReactNode;
  /** Controlled open state — omit for an uncontrolled dialog. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = 'Confirm',
  pendingLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  pending = false,
  confirmDisabled = false,
  children,
  open,
  onOpenChange,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="quiet">{cancelLabel}</Button>
          </DialogClose>
          <AsyncButton
            type="button"
            variant="danger"
            pending={pending}
            pendingLabel={pendingLabel}
            disabled={confirmDisabled || pending}
            onClick={onConfirm}
          >
            {confirmLabel}
          </AsyncButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { ConfirmDialog };
export type { ConfirmDialogProps };
