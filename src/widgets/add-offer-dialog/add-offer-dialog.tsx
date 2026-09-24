'use client';

import { PlusIcon } from 'lucide-react';
import { useState } from 'react';

import { AddOfferForm } from '@/features/job-offer/components/add-offer-form';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';

// X-dlg-add.dc.html: 520px (md) dialog opened from the top bar's primary
// action slot. The Card/panel chrome lives here, not in AddOfferForm, so
// TASK-120's onboarding step 3 can host the bare form without dialog chrome.
export function AddOfferDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="primary" size="md">
          <PlusIcon className="size-[14px]" />
          Add offer
        </Button>
      </DialogTrigger>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Add offer</DialogTitle>
          <DialogDescription>
            Paste a link to a job posting or its full text.
          </DialogDescription>
        </DialogHeader>
        <Card>
          <CardContent>
            <AddOfferForm onSuccess={() => setOpen(false)} />
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
