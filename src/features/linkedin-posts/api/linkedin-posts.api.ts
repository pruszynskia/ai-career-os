import type { PostStatus } from '@/entities/post/types';
import type {
  GeneratePostResponse,
  PlanPostsResponse,
  SchedulePostResponse,
  UpdatePostResponse,
} from '@/features/linkedin-posts/types';

export async function generatePost(
  topic: string,
): Promise<GeneratePostResponse> {
  const response = await fetch('/api/posts/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(body?.message ?? 'Failed to generate the post.');
  }

  return response.json();
}

async function patchSchedule<T>(
  body: Record<string, unknown>,
  fallbackMessage: string,
): Promise<T> {
  const response = await fetch('/api/posts/schedule', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const responseBody = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(responseBody?.message ?? fallbackMessage);
  }

  return response.json();
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

export async function updatePost(
  id: string,
  values: { content?: string; status?: PostStatus },
): Promise<UpdatePostResponse> {
  const response = await fetch(`/api/posts/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(body?.message ?? 'Failed to update the post.');
  }

  return response.json();
}

export async function deletePost(id: string): Promise<void> {
  const response = await fetch(`/api/posts/${id}`, { method: 'DELETE' });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(body?.message ?? 'Failed to delete the post.');
  }
}

export async function planPosts(): Promise<PlanPostsResponse> {
  const response = await fetch('/api/posts/plan', { method: 'POST' });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(body?.message ?? 'Failed to plan the next posts.');
  }

  return response.json();
}
