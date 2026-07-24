import type { CvDocument, JobOffer } from '@prisma/client';

export interface AddOfferResponse {
  jobOffer: JobOffer;
}

export interface ToggleFavoriteResponse {
  jobOffer: JobOffer;
}

export interface MatchOfferResponse {
  jobOffer: JobOffer;
}

export interface TailorCvResponse {
  cvDocument: CvDocument;
}

export interface RecruiterMessageResponse {
  message: string;
}

export interface CoverLetterResponse {
  content: string;
}
