import type { Post } from '@/entities/post/types';

export interface GeneratePostResponse {
  post: Post;
}

export interface SchedulePostResponse {
  post: Post;
}

export interface PlanPostsResponse {
  posts: Post[];
}
