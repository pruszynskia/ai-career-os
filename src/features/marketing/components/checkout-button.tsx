'use client';

import { useCreateCheckoutSession } from '@/features/marketing/hooks/use-create-checkout-session';
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
  const { mutate, isPending, error } = useCreateCheckoutSession();

  return (
    <VStack gap={2}>
      <Button
        type="button"
        variant={featured ? 'default' : 'outline'}
        className="w-full"
        onClick={() => mutate(plan)}
        disabled={isPending}
      >
        {isPending ? 'Redirecting…' : label}
      </Button>
      {error ? <Text color="destructive">{error.message}</Text> : null}
    </VStack>
  );
}
