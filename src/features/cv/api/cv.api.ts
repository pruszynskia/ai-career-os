import type { UploadCvResponse } from '@/features/cv/types';

export async function uploadCv(file: File): Promise<UploadCvResponse> {
  const formData = new FormData();
  formData.set('file', file);

  const response = await fetch('/api/cv/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(body?.message ?? 'Failed to upload CV.');
  }

  return response.json();
}
