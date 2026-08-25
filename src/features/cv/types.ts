import type { CvDocument } from '@/entities/cv-document/types';
import type { Profile } from '@/entities/profile/types';
import { z } from 'zod';

export interface UploadCvResponse {
  profile: Profile;
  cvDocument: CvDocument;
}

const improvementCategorySchema = z.enum([
  'ats-keywords',
  'quantification',
  'action-verbs',
  'clarity',
  'formatting',
  'other',
]);

const cvImprovementSchema = z.object({
  category: improvementCategorySchema,
  before: z.string(),
  after: z.string(),
  rationale: z.string(),
});

export const optimizedCvSchema = z.object({
  optimizedContent: z.string(),
  improvements: z.array(cvImprovementSchema),
});

export type CvImprovement = z.infer<typeof cvImprovementSchema>;

export interface OptimizeCvResponse {
  cvDocument: CvDocument;
  improvements: CvImprovement[];
}
