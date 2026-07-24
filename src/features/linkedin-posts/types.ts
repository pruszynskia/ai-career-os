import type { Post } from '@prisma/client';

export interface GeneratePostResponse {
  post: Post;
}

export interface SchedulePostResponse {
  post: Post;
}

export interface PlanPostsResponse {
  posts: Post[];
}
