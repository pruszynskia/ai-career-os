import type { Post } from '@/entities/post/types';
import type { PostCampaign } from '@/entities/post-campaign/types';

export interface GeneratePostResponse {
  post: Post;
}

export interface GenerateCampaignResponse {
  campaign: PostCampaign;
  posts: Post[];
}

export interface SchedulePostResponse {
  post: Post;
}

export interface UpdatePostResponse {
  post: Post;
}

export interface PlanPostsResponse {
  posts: Post[];
}
