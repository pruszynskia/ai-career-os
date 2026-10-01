import { requestJson } from '@/shared/api/request';
import type { CvDocument } from '@/entities/cv-document/types';

export function updateDocument(
  id: string,
  content: string,
): Promise<{ cvDocument: CvDocument }> {
  return requestJson(
    `/api/documents/${id}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    },
    'Failed to save the document.',
  );
}
