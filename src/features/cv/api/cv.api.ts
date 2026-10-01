import { requestJson } from '@/shared/api/request';
import type {
  OptimizeCoverLetterResponse,
  OptimizeCvResponse,
  UploadCoverLetterResponse,
  UploadCvResponse,
} from '@/features/cv/types';

export function uploadCv(file: File): Promise<UploadCvResponse> {
  const formData = new FormData();
  formData.set('file', file);

  return requestJson(
    '/api/cv/upload',
    { method: 'POST', body: formData },
    'Failed to upload CV.',
  );
}

export function optimizeCv(): Promise<OptimizeCvResponse> {
  return requestJson(
    '/api/cv/optimize',
    { method: 'POST' },
    'Failed to optimize CV.',
  );
}

export function uploadCoverLetter(
  file: File,
): Promise<UploadCoverLetterResponse> {
  const formData = new FormData();
  formData.set('file', file);

  return requestJson(
    '/api/cover-letter/upload',
    { method: 'POST', body: formData },
    'Failed to upload cover letter.',
  );
}

export function optimizeCoverLetter(): Promise<OptimizeCoverLetterResponse> {
  return requestJson(
    '/api/cover-letter/optimize',
    { method: 'POST' },
    'Failed to optimize cover letter.',
  );
}
