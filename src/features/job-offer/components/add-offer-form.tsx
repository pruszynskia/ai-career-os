'use client';

import Link from 'next/link';
import { useState } from 'react';

import { useAddOffer } from '@/features/job-offer/hooks/use-add-offer';
import { useDeleteOffer } from '@/features/job-offer/hooks/use-delete-offer';
import type { FingerprintMatchSignal } from '@/shared/utils/offer-fingerprint';
import { Spinner } from '@/shared/ui/primitives';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
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

export function AddOfferForm() {
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
        setDuplicate(
          response.duplicateOfferId && response.duplicateMatchSignal
            ? {
                existingOfferId: response.duplicateOfferId,
                createdOfferId: response.jobOffer.id,
                signal: response.duplicateMatchSignal,
              }
            : null,
        );
      },
    });
  }

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={mode === 'url' ? 'default' : 'outline'}
              onClick={() => setMode('url')}
            >
              Paste URL
            </Button>
            <Button
              type="button"
              variant={mode === 'raw-text' ? 'default' : 'outline'}
              onClick={() => setMode('raw-text')}
            >
              Paste text
            </Button>
          </div>

          {mode === 'url' ? (
            <Input
              type="url"
              placeholder="https://company.com/careers/job-123"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              disabled={mutation.isPending}
            />
          ) : (
            <Textarea
              placeholder="Paste the job offer text"
              value={rawText}
              onChange={(event) => setRawText(event.target.value)}
              disabled={mutation.isPending}
            />
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
            <div className="flex flex-col gap-2 text-sm text-amber-600">
              <p role="status">
                This matches {SIGNAL_LABEL[duplicate.signal]} of an offer you
                already added.{' '}
                <Link
                  href={`/offers/${duplicate.existingOfferId}`}
                  className="underline"
                >
                  View the existing offer
                </Link>
                .
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDuplicate(null)}
                >
                  Keep both
                </Button>
                <Button
                  type="button"
                  variant="destructive"
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
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
