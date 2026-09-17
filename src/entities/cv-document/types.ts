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

// Tailoring report (TASK-082): a mechanical, non-AI verdict on the CV
// tailor-cv.service.ts just generated, checked against the posting keywords
// TASK-079 already extracted onto the offer's fit assessment. keywords
// doubles as the evidence trace - each covered entry names the claim id
// (from claimsUsed) that backs it.
export const tailoringReportKeywordSchema = z.object({
  keyword: z.string(),
  covered: z.boolean(),
  matchedSpan: z.string().nullable(),
  evidenceClaimId: z.string().nullable(),
});

export type TailoringReportKeyword = z.infer<
  typeof tailoringReportKeywordSchema
>;

export const tailoringReportSchema = z.object({
  keywords: z.array(tailoringReportKeywordSchema),
  coveredCount: z.number().int(),
  totalCount: z.number().int(),
  // Posting requirements the evidence base doesn't carry at all - stated
  // plainly, never softened (see keyword-coverage.ts).
  gaps: z.array(z.string()),
});

export type TailoringReport = z.infer<typeof tailoringReportSchema>;

export const cvDocumentSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  isMaster: z.boolean(),
  content: z.string(),
  jobOfferId: z.string().nullable(),
  kind: cvDocumentKindSchema,
  tailoringReport: tailoringReportSchema.nullable(),
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
  tailoringReport: TailoringReport | null;
  createdAt: Date;
  updatedAt: Date;
}
