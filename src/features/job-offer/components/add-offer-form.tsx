'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useAddOffer } from '@/features/job-offer/hooks/use-add-offer';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';

export function AddOfferForm() {
  const router = useRouter();
  const [mode, setMode] = useState<'url' | 'raw-text'>('url');
  const [url, setUrl] = useState('');
  const [rawText, setRawText] = useState('');
  const [duplicateOfferId, setDuplicateOfferId] = useState<string | null>(
    null,
  );
  const mutation = useAddOffer();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const input =
      mode === 'url' ? { url: url.trim() } : { rawText: rawText.trim() };
    if (mode === 'url' ? !input.url : !input.rawText) return;

    setDuplicateOfferId(null);
    mutation.mutate(input, {
      onSuccess: (response) => {
        setUrl('');
        setRawText('');
        setDuplicateOfferId(response.duplicateOfferId ?? null);
        router.refresh();
      },
    });
  }

  return (
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
          mutation.isPending || (mode === 'url' ? !url.trim() : !rawText.trim())
        }
        className="self-start"
      >
        {mutation.isPending ? 'Adding…' : 'Add offer'}
      </Button>

      {mutation.isError && (
        <p role="alert" className="text-sm text-destructive">
          {mutation.error.message}
        </p>
      )}

      {duplicateOfferId && (
        <p role="status" className="text-sm text-amber-600">
          This looks like an offer you already added.{' '}
          <Link href={`/offers/${duplicateOfferId}`} className="underline">
            View the existing offer
          </Link>
          .
        </p>
      )}
    </form>
  );
}
