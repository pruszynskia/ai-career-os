import { z } from 'zod';

export const aiUsageSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  action: z.string(),
  createdAt: z.date(),
});

export interface AiUsage {
  id: string;
  ownerId: string;
  action: string;
  createdAt: Date;
}
