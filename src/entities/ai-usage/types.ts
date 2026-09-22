import { z } from 'zod';

export const aiUsageSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  action: z.string(),
  // Which adapter actually served the call (TASK-089's fallback chain).
  // Null for rows written before that migration.
  provider: z.string().nullable(),
  createdAt: z.date(),
});

export interface AiUsage {
  id: string;
  ownerId: string;
  action: string;
  provider: string | null;
  createdAt: Date;
}
