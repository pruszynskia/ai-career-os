import type { CvDocument } from '@/entities/cv-document/types';
import type { Profile } from '@/entities/profile/types';
import { z } from 'zod';

export interface UploadCvResponse {
  profile: Profile;
  cvDocument: CvDocument;
}

export const optimizedCvSchema = z.object({
  optimizedContent: z.string(),
  improvements: z.array(z.string()),
});

export interface OptimizeCvResponse {
  cvDocument: CvDocument;
  improvements: string[];
}
