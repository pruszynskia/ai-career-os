'use client';

import { useState } from 'react';

import { Button } from '@/shared/ui/button';
import { Text, VStack } from '@/shared/ui/primitives';

export function CheckoutButton({
  plan,
  label,
  featured,
}: {
  plan: 'pro';
  label: string;
  featured: boolean;
}) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setIsPending(true);
    setError(null);

    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await response.json();

      if (!response.ok || typeof data.url !== 'string') {
        throw new Error(data.message ?? 'Failed to start checkout.');
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start checkout.');
      setIsPending(false);
    }
  }

  return (
    <VStack gap={2}>
      <Button
        type="button"
        variant={featured ? 'default' : 'outline'}
        className="w-full"
        onClick={handleClick}
        disabled={isPending}
      >
        {isPending ? 'Redirecting…' : label}
      </Button>
      {error ? <Text color="destructive">{error}</Text> : null}
    </VStack>
  );
}
