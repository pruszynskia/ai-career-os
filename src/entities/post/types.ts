export type PostStatus = 'DRAFT' | 'SCHEDULED' | 'SENT';

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
