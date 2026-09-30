import { requestJson } from '@/shared/api/request';
import type { PostStatus } from '@/entities/post/types';
import type {
  GenerateCampaignResponse,
  GeneratePostResponse,
  PlanPostsResponse,
  SchedulePostResponse,
  UpdatePostResponse,
} from '@/features/linkedin-posts/types';

export function generatePost(topic: string): Promise<GeneratePostResponse> {
  return requestJson(
    '/api/posts/generate',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic }),
    },
    'Failed to generate the post.',
  );
}

function patchSchedule<T>(
  body: Record<string, unknown>,
  fallbackMessage: string,
): Promise<T> {
  return requestJson(
    '/api/posts/schedule',
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
    fallbackMessage,
  );
}

export function schedulePost(
  id: string,
  scheduledAt: Date,
): Promise<SchedulePostResponse> {
  return patchSchedule(
    { action: 'schedule', id, scheduledAt: scheduledAt.toISOString() },
    'Failed to schedule the post.',
  );
}

export function markPostSent(id: string): Promise<SchedulePostResponse> {
  return patchSchedule(
    { action: 'mark-sent', id },
    'Failed to mark the post as sent.',
  );
}

export function updatePost(
  id: string,
  values: { content?: string; status?: PostStatus },
): Promise<UpdatePostResponse> {
  return requestJson(
    `/api/posts/${id}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    },
    'Failed to update the post.',
  );
}

export async function deletePost(id: string): Promise<void> {
  await requestJson(
    `/api/posts/${id}`,
    { method: 'DELETE' },
    'Failed to delete the post.',
  );
}

export function planPosts(): Promise<PlanPostsResponse> {
  return requestJson(
    '/api/posts/plan',
    { method: 'POST' },
    'Failed to plan the next posts.',
  );
}

export function generateCampaign(
  theme: string,
  postCount: number,
  cadenceDays: number,
): Promise<GenerateCampaignResponse> {
  return requestJson(
    '/api/posts/campaigns',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme, postCount, cadenceDays }),
    },
    'Failed to generate the campaign.',
  );
}
