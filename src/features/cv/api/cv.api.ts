import type {
  OptimizeCoverLetterResponse,
  OptimizeCvResponse,
  UploadCoverLetterResponse,
  UploadCvResponse,
} from '@/features/cv/types';

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

export async function uploadCoverLetter(
  file: File,
): Promise<UploadCoverLetterResponse> {
  const formData = new FormData();
  formData.set('file', file);

  const response = await fetch('/api/cover-letter/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(body?.message ?? 'Failed to upload cover letter.');
  }

  return response.json();
}

export async function optimizeCoverLetter(): Promise<OptimizeCoverLetterResponse> {
  const response = await fetch('/api/cover-letter/optimize', {
    method: 'POST',
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(body?.message ?? 'Failed to optimize cover letter.');
  }

  return response.json();
}
