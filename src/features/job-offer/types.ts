import type { CvDocument } from '@/entities/cv-document/types';
import type { JobOffer } from '@/entities/job-offer/types';

export interface AddOfferResponse {
  jobOffer: JobOffer;
  duplicateOfferId?: string;
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
