import { z } from 'zod';

export const parsedJobOfferSchema = z.object({
  company: z.string(),
  title: z.string(),
  description: z.string(),
});

export type ParsedJobOffer = z.infer<typeof parsedJobOfferSchema>;
