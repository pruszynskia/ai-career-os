'use client';

import { useState } from 'react';
import Link from 'next/link';

import type { Subscription } from '@/entities/subscription/types';
import { PlanBadge } from '@/features/billing/components/plan-badge';
import { requestJson } from '@/shared/api/request';
import { formatDate } from '@/shared/utils/format-date';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Text, VStack } from '@/shared/ui/primitives';

export function BillingPanel({
  subscription,
}: {
  subscription: Subscription | null;
}) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleManageBilling() {
    setIsPending(true);
    setError(null);
    try {
      const body = await requestJson<{ url?: string }>(
        '/api/billing/portal',
        { method: 'POST' },
        'Failed to open the billing portal.',
      );
      if (typeof body.url !== 'string') {
        throw new Error('Failed to open the billing portal.');
      }

      window.location.href = body.url;
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Failed to open the billing portal.',
      );
      setIsPending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing</CardTitle>
      </CardHeader>
      <CardContent>
        <VStack gap={4}>
          {subscription ? (
            <>
              <PlanBadge
                plan={subscription.plan}
                status={subscription.status}
              />
              {subscription.currentPeriodEnd ? (
                <Text color="muted">
                  Renews on {formatDate(subscription.currentPeriodEnd)}
                </Text>
              ) : null}
              <Button
                type="button"
                onClick={handleManageBilling}
                disabled={isPending}
              >
                {isPending ? 'Opening…' : 'Manage billing'}
              </Button>
            </>
          ) : (
            <>
              <Text color="muted">
                You&apos;re on the Free plan. Upgrade to Pro for more AI
                actions.
              </Text>
              <Button asChild>
                <Link href="/pricing">Upgrade to Pro</Link>
              </Button>
            </>
          )}
          {error ? (
            <Text color="destructive" role="alert">
              {error}
            </Text>
          ) : null}
        </VStack>
      </CardContent>
    </Card>
  );
}
