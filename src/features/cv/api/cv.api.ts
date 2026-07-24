import type { OptimizeCvResponse, UploadCvResponse } from '@/features/cv/types';

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

export async function optimizeCv(): Promise<OptimizeCvResponse> {
  const response = await fetch('/api/cv/optimize', { method: 'POST' });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(body?.message ?? 'Failed to optimize CV.');
  }

  return response.json();
}
