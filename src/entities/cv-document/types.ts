import { z } from 'zod';

export const cvDocumentKindSchema = z.enum([
  'MASTER',
  'OPTIMIZED',
  'TAILORED',
  'COVER_LETTER',
  'OPTIMIZED_COVER_LETTER',
]);

export type CvDocumentKind = z.infer<typeof cvDocumentKindSchema>;

export const CV_DOCUMENT_KIND_LABEL: Record<CvDocumentKind, string> = {
  MASTER: 'Master',
  OPTIMIZED: 'Optimized',
  TAILORED: 'Tailored',
  COVER_LETTER: 'Cover Letter',
  OPTIMIZED_COVER_LETTER: 'Optimized Cover Letter',
};

// A CV may be attached to an application when it was tailored for that
// offer, or when it is the owner's master CV — the fallback used before
// anything has been generated for the offer (TASK-044).
export function canBeSentCv(
  cv: Pick<CvDocument, 'jobOfferId' | 'isMaster' | 'kind'>,
  jobOfferId: string,
): boolean {
  return cv.jobOfferId === jobOfferId || (cv.isMaster && cv.kind === 'MASTER');
}

export const cvDocumentSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  isMaster: z.boolean(),
  content: z.string(),
  jobOfferId: z.string().nullable(),
  kind: cvDocumentKindSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export interface CvDocument {
  id: string;
  ownerId: string;
  isMaster: boolean;
  content: string;
  jobOfferId: string | null;
  kind: CvDocumentKind;
  createdAt: Date;
  updatedAt: Date;
}
