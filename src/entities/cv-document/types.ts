import { z } from 'zod';

export const cvDocumentSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  isMaster: z.boolean(),
  content: z.string(),
  jobOfferId: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export interface CvDocument {
  id: string;
  ownerId: string;
  isMaster: boolean;
  content: string;
  jobOfferId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
