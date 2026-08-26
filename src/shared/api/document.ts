import type { CvDocument } from '@/entities/cv-document/types';

export async function updateDocument(
  id: string,
  content: string,
): Promise<{ cvDocument: CvDocument }> {
  const response = await fetch(`/api/documents/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(body?.message ?? 'Failed to save the document.');
  }

  return response.json();
}
