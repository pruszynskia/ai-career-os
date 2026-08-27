'use client';

import { useState } from 'react';

import { useDeleteOffer } from '@/features/job-offer/hooks/use-delete-offer';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import { Spinner } from '@/shared/ui/primitives';

export function DeleteOfferButton({
  offerId,
  redirectTo,
}: {
  offerId: string;
  redirectTo?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const mutation = useDeleteOffer(redirectTo);

  function handleConfirm() {
    mutation.mutate({ id: offerId }, { onSuccess: () => setIsOpen(false) });
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this offer?</DialogTitle>
          <DialogDescription>
            This permanently removes the offer and any tailored CVs or cover
            letters generated for it. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter showCloseButton>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={mutation.isPending}
          >
            {mutation.isPending && <Spinner size="sm" />}
            {mutation.isPending ? 'Deleting…' : 'Delete offer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
