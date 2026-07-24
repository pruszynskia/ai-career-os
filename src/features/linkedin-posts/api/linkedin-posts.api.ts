import type { GeneratePostResponse } from '@/features/linkedin-posts/types';

export async function generatePost(topic: string): Promise<GeneratePostResponse> {
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
