'use client';

import Link from 'next/link';
import { useState } from 'react';

import { useAddOffer } from '@/features/job-offer/hooks/use-add-offer';
import { useDeleteOffer } from '@/features/job-offer/hooks/use-delete-offer';
import type { FingerprintMatchSignal } from '@/shared/utils/offer-fingerprint';
import { Label, Spinner } from '@/shared/ui/primitives';
import { Banner } from '@/shared/ui/banner';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@/shared/ui/segmented-control';
import { Textarea } from '@/shared/ui/textarea';

const SIGNAL_LABEL: Record<FingerprintMatchSignal, string> = {
  'canonical-url': 'the same job link',
  'content-hash': 'identical offer text',
  'company-title': 'the same company and title',
};

interface DuplicateState {
  existingOfferId: string;
  createdOfferId: string;
  signal: FingerprintMatchSignal;
}

interface AddOfferFormProps {
  /** Called after a successful, non-duplicate submit (e.g. to close a host dialog). */
  onSuccess?: () => void;
}

export function AddOfferForm({ onSuccess }: AddOfferFormProps = {}) {
  const [mode, setMode] = useState<'url' | 'raw-text'>('url');
  const [url, setUrl] = useState('');
  const [rawText, setRawText] = useState('');
  const [duplicate, setDuplicate] = useState<DuplicateState | null>(null);
  const mutation = useAddOffer();
  const deleteMutation = useDeleteOffer();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const input =
      mode === 'url' ? { url: url.trim() } : { rawText: rawText.trim() };
    if (mode === 'url' ? !input.url : !input.rawText) return;

    setDuplicate(null);
    mutation.mutate(input, {
      onSuccess: (response) => {
        setUrl('');
        setRawText('');
        const nextDuplicate =
          response.duplicateOfferId && response.duplicateMatchSignal
            ? {
                existingOfferId: response.duplicateOfferId,
                createdOfferId: response.jobOffer.id,
                signal: response.duplicateMatchSignal,
              }
            : null;
        setDuplicate(nextDuplicate);
        if (!nextDuplicate) onSuccess?.();
      },
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <SegmentedControl
        aria-label="Offer source"
        value={mode}
        onValueChange={(value) => setMode(value as 'url' | 'raw-text')}
        className="self-start"
      >
        <SegmentedControlItem value="url">Paste URL</SegmentedControlItem>
        <SegmentedControlItem value="raw-text">Paste text</SegmentedControlItem>
      </SegmentedControl>

      {mode === 'url' ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="add-offer-url">Job offer link</Label>
          <Input
            id="add-offer-url"
            type="url"
            placeholder="https://company.com/careers/job-123"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            disabled={mutation.isPending}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="add-offer-raw-text">Job offer text</Label>
          <Textarea
            id="add-offer-raw-text"
            placeholder="Paste the job offer text"
            value={rawText}
            onChange={(event) => setRawText(event.target.value)}
            disabled={mutation.isPending}
          />
        </div>
      )}

      <Button
        type="submit"
        disabled={
          mutation.isPending ||
          (mode === 'url' ? !url.trim() : !rawText.trim())
        }
        className="self-start"
      >
        {mutation.isPending && <Spinner size="sm" />}
        {mutation.isPending ? 'Adding…' : 'Add offer'}
      </Button>

      {duplicate && (
        <Banner
          tone="warning"
          actions={
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setDuplicate(null)}
              >
                Keep both
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                disabled={deleteMutation.isPending}
                onClick={() =>
                  deleteMutation.mutate(
                    { id: duplicate.createdOfferId },
                    { onSuccess: () => setDuplicate(null) },
                  )
                }
              >
                {deleteMutation.isPending && <Spinner size="sm" />}
                Delete this one
              </Button>
            </div>
          }
        >
          This matches {SIGNAL_LABEL[duplicate.signal]} of an offer you
          already added.{' '}
          <Link
            href={`/offers/${duplicate.existingOfferId}`}
            className="underline"
          >
            View the existing offer
          </Link>
          .
        </Banner>
      )}
    </form>
  );
}
