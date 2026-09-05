export async function createCheckoutSession(
  plan: 'pro',
): Promise<{ url: string }> {
  const response = await fetch('/api/billing/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan }),
  });

  const body = (await response.json().catch(() => null)) as {
    url?: string;
    message?: string;
  } | null;

  if (!response.ok || typeof body?.url !== 'string') {
    throw new Error(body?.message ?? 'Failed to start checkout.');
  }

  return { url: body.url };
}
