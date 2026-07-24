import type { JobOffer } from '@prisma/client';

export interface AddOfferResponse {
  jobOffer: JobOffer;
}

export interface ToggleFavoriteResponse {
  jobOffer: JobOffer;
}
