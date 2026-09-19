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
  campaignId: z.string().nullable(),
  claimsUsed: z.array(z.string()),
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
  campaignId: string | null;
  // Evidence-base claim ids this post was built on (TASK-087, ADR-017).
  // Empty for posts generated before this column existed.
  claimsUsed: string[];
  createdAt: Date;
  updatedAt: Date;
}
