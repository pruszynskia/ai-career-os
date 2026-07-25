import { z } from 'zod';

export type PostStatus = 'DRAFT' | 'SCHEDULED' | 'SENT';

export const postStatusSchema = z.enum(['DRAFT', 'SCHEDULED', 'SENT']);

export const postSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  content: z.string(),
  status: postStatusSchema,
  scheduledAt: z.date().nullable(),
  sentAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export interface Post {
  id: string;
  ownerId: string;
  content: string;
  status: PostStatus;
  scheduledAt: Date | null;
  sentAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
