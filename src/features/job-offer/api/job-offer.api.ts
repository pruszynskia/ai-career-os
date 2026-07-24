import type {
  AddOfferResponse,
  ToggleFavoriteResponse,
} from '@/features/job-offer/types';

export async function addOffer(input: {
  url?: string;
  rawText?: string;
}): Promise<AddOfferResponse> {
  const response = await fetch('/api/offers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(body?.message ?? 'Failed to add the offer.');
  }

  return response.json();
}

export async function toggleFavorite(
  id: string,
  isFavorite: boolean,
): Promise<ToggleFavoriteResponse> {
  const response = await fetch(`/api/offers/${id}/favorite`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isFavorite }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(body?.message ?? 'Failed to update the offer.');
  }

  return response.json();
}
