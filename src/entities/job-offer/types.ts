import { z } from 'zod';

export const parsedJobOfferSchema = z.object({
  company: z.string(),
  title: z.string(),
  description: z.string(),
});

export type ParsedJobOffer = z.infer<typeof parsedJobOfferSchema>;

export const offerSourceSchema = z.enum(['URL', 'RAW_TEXT']);

export type OfferSource = 'URL' | 'RAW_TEXT';

export const offerSortOptions = ['createdAt', 'matchScore', 'company'] as const;

export type OfferSortOption = (typeof offerSortOptions)[number];

export const OFFER_SORT_LABELS: Record<OfferSortOption, string> = {
  createdAt: 'Newest first',
  matchScore: 'Best match',
  company: 'Company (A–Z)',
};

export const jobOfferSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  url: z.string().nullable(),
  source: offerSourceSchema,
  rawContent: z.string(),
  company: z.string(),
  title: z.string(),
  description: z.string(),
  matchScore: z.number().nullable(),
  expiresAt: z.date().nullable(),
  isFavorite: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export interface JobOffer {
  id: string;
  ownerId: string;
  url: string | null;
  source: OfferSource;
  rawContent: string;
  company: string;
  title: string;
  description: string;
  matchScore: number | null;
  expiresAt: Date | null;
  isExpired: boolean;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}
