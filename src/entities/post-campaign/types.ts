import { z } from 'zod';

export const postCampaignSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  theme: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export interface PostCampaign {
  id: string;
  ownerId: string;
  theme: string;
  createdAt: Date;
  updatedAt: Date;
}
