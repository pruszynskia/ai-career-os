import { requestJson } from '@/shared/api/request';

export async function createCheckoutSession(
  plan: 'pro',
): Promise<{ url: string }> {
  const body = await requestJson<{ url?: string }>(
    '/api/billing/checkout',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    },
    'Failed to start checkout.',
  );

  if (typeof body.url !== 'string') {
    throw new Error('Failed to start checkout.');
  }

  return { url: body.url };
}
