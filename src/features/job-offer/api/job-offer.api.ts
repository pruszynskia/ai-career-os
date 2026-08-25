import type {
  AddOfferResponse,
  CoverLetterResponse,
  MatchOfferResponse,
  RecruiterMessageResponse,
  TailorCvResponse,
  ToggleFavoriteResponse,
  UpdateOfferResponse,
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

export async function updateOffer(
  id: string,
  input: Partial<{ company: string; title: string; description: string }>,
): Promise<UpdateOfferResponse> {
  const response = await fetch(`/api/offers/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(body?.message ?? 'Failed to update the offer.');
  }

  return response.json();
}

async function postOfferAction<T>(
  id: string,
  action: string,
  fallbackMessage: string,
): Promise<T> {
  const response = await fetch(`/api/offers/${id}/${action}`, {
    method: 'POST',
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(body?.message ?? fallbackMessage);
  }

  return response.json();
}

export function matchOffer(id: string): Promise<MatchOfferResponse> {
  return postOfferAction(id, 'match', 'Failed to match the offer.');
}

export function tailorCv(id: string): Promise<TailorCvResponse> {
  return postOfferAction(id, 'tailor-cv', 'Failed to tailor the CV.');
}

export function generateRecruiterMessage(
  id: string,
): Promise<RecruiterMessageResponse> {
  return postOfferAction(
    id,
    'recruiter-message',
    'Failed to generate the recruiter message.',
  );
}

export function generateCoverLetter(id: string): Promise<CoverLetterResponse> {
  return postOfferAction(
    id,
    'cover-letter',
    'Failed to generate the cover letter.',
  );
}
