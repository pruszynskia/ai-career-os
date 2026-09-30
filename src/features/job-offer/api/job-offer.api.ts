import { EntitlementRequiredError, requestJson } from '@/shared/api/request';
import type {
  AddOfferResponse,
  CoverLetterResponse,
  FollowUpResponse,
  MatchOfferResponse,
  OutreachResponse,
  TailorCvResponse,
  ToggleFavoriteResponse,
  UpdateOfferResponse,
} from '@/features/job-offer/types';

// Thrown on the no-contact path (422): no draft was produced, only the
// posting URL and the reason to show instead (ADR-020).
export class OutreachBlockedError extends Error {
  constructor(
    message: string,
    public readonly postingUrl: string | null,
  ) {
    super(message);
    this.name = 'OutreachBlockedError';
  }
}

export function addOffer(input: {
  url?: string;
  rawText?: string;
}): Promise<AddOfferResponse> {
  return requestJson(
    '/api/offers',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    },
    'Failed to add the offer.',
  );
}

export function toggleFavorite(
  id: string,
  isFavorite: boolean,
): Promise<ToggleFavoriteResponse> {
  return requestJson(
    `/api/offers/${id}/favorite`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isFavorite }),
    },
    'Failed to update the offer.',
  );
}

export function updateOffer(
  id: string,
  input: Partial<{
    company: string;
    title: string;
    description: string;
    // ISO string (JSON has no Date type) or null to clear it (PIPE-5).
    expiresAt: string | null;
  }>,
): Promise<UpdateOfferResponse> {
  return requestJson(
    `/api/offers/${id}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    },
    'Failed to update the offer.',
  );
}

export async function deleteOffer(id: string): Promise<void> {
  await requestJson(
    `/api/offers/${id}`,
    { method: 'DELETE' },
    'Failed to delete the offer.',
  );
}

function postOfferAction<T>(
  id: string,
  action: string,
  fallbackMessage: string,
): Promise<T> {
  return requestJson(
    `/api/offers/${id}/${action}`,
    { method: 'POST' },
    fallbackMessage,
  );
}

export function matchOffer(id: string): Promise<MatchOfferResponse> {
  return postOfferAction(id, 'match', 'Failed to match the offer.');
}

export function tailorCv(id: string): Promise<TailorCvResponse> {
  return postOfferAction(id, 'tailor-cv', 'Failed to tailor the CV.');
}

export async function generateOutreach(
  id: string,
  contact: { name: string; profileUrl?: string },
): Promise<OutreachResponse> {
  const response = await fetch(`/api/offers/${id}/outreach`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contactName: contact.name,
      contactUrl: contact.profileUrl || undefined,
    }),
  }).catch(() => {
    throw new Error('Network error. Check your connection and try again.');
  });

  const responseBody = (await response.json().catch(() => null)) as {
    message?: string;
    postingUrl?: string | null;
    upgradePath?: string;
    // Wire shape only: JSON has no Date type, so createdAt arrives as an
    // ISO string here and is parsed into the real OutreachMessage below -
    // asserting it straight to Date hid that mismatch instead of fixing it.
    messages?: (Omit<OutreachResponse['messages'][number], 'createdAt'> & {
      createdAt: string;
    })[];
  } | null;

  if (!response.ok) {
    if (response.status === 402) {
      throw new EntitlementRequiredError(
        responseBody?.message ?? 'This feature requires the Pro plan.',
        responseBody?.upgradePath ?? '/pricing',
      );
    }
    if (response.status === 422 && responseBody?.postingUrl !== undefined) {
      throw new OutreachBlockedError(
        responseBody.message ?? 'Add a contact name before drafting outreach.',
        responseBody.postingUrl,
      );
    }
    throw new Error(
      responseBody?.message ?? 'Failed to generate outreach drafts.',
    );
  }

  return {
    messages: (responseBody?.messages ?? []).map((message) => ({
      ...message,
      createdAt: new Date(message.createdAt),
    })),
  };
}

export async function draftFollowUp(id: string): Promise<FollowUpResponse> {
  const body = await requestJson<{
    message: Omit<OutreachResponse['messages'][number], 'createdAt'> & {
      createdAt: string;
    };
  }>(
    `/api/offers/${id}/outreach/follow-up`,
    { method: 'POST' },
    'Failed to draft a follow-up.',
  );

  return {
    message: { ...body.message, createdAt: new Date(body.message.createdAt) },
  };
}

export async function markOutreachSent(
  offerId: string,
  messageId: string,
): Promise<void> {
  await requestJson(
    `/api/offers/${offerId}/outreach/mark-sent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId }),
    },
    'Failed to mark the message as sent.',
  );
}

export function generateCoverLetter(id: string): Promise<CoverLetterResponse> {
  return postOfferAction(
    id,
    'cover-letter',
    'Failed to generate the cover letter.',
  );
}
