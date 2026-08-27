import type { ApplicationBundle } from '@/entities/application/types';
import type { CvDocument } from '@/entities/cv-document/types';
import type { JobOffer } from '@/entities/job-offer/types';

// A job offer annotated with its application, if the offer is tracked.
export type OfferWithApplication = JobOffer & {
  application: ApplicationBundle | null;
};

export interface AddOfferResponse {
  jobOffer: JobOffer;
  duplicateOfferId?: string;
}

export interface ToggleFavoriteResponse {
  jobOffer: JobOffer;
}

export interface UpdateOfferResponse {
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
  cvDocument: CvDocument;
}
