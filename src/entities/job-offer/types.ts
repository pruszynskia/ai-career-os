import { z } from 'zod';

export const parsedJobOfferSchema = z.object({
  company: z.string(),
  title: z.string(),
  description: z.string(),
});

export type ParsedJobOffer = z.infer<typeof parsedJobOfferSchema>;

export type OfferSource = 'URL' | 'RAW_TEXT';

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
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}
