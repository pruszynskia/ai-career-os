'use client';

import { useState } from 'react';

import { useDeleteOffer } from '@/features/job-offer/hooks/use-delete-offer';
import { Button } from '@/shared/ui/button';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';

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
    <ConfirmDialog
      open={isOpen}
      onOpenChange={setIsOpen}
      trigger={
        <Button variant="outline" size="sm">
          Delete
        </Button>
      }
      title="Delete this offer?"
      description="This permanently removes the offer and any tailored CVs or cover letters generated for it. This cannot be undone."
      confirmLabel="Delete offer"
      pendingLabel="Deleting…"
      pending={mutation.isPending}
      onConfirm={handleConfirm}
    />
  );
}
