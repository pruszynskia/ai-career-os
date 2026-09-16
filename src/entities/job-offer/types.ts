import { z } from 'zod';

export const parsedJobOfferSchema = z.object({
  company: z.string(),
  title: z.string(),
  description: z.string(),
});

export type ParsedJobOffer = z.infer<typeof parsedJobOfferSchema>;

export const offerSourceSchema = z.enum(['URL', 'RAW_TEXT']);

export type OfferSource = 'URL' | 'RAW_TEXT';

export const offerSortOptions = [
  'createdAt',
  'matchScore',
  'callbackProbability',
  'company',
] as const;

export type OfferSortOption = (typeof offerSortOptions)[number];

export const OFFER_SORT_LABELS: Record<OfferSortOption, string> = {
  createdAt: 'Newest first',
  matchScore: 'Best match',
  callbackProbability: 'Best callback odds',
  company: 'Company (A–Z)',
};

export const jobOfferSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  url: z.string().nullable(),
  source: offerSourceSchema,
  rawContent: z.string(),
  company: z.string(),
  title: z.string(),
  description: z.string(),
  matchScore: z.number().nullable(),
  expiresAt: z.date().nullable(),
  isFavorite: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export interface JobOffer {
  id: string;
  ownerId: string;
  url: string | null;
  source: OfferSource;
  rawContent: string;
  company: string;
  title: string;
  description: string;
  matchScore: number | null;
  fit: FitAssessment | null;
  expiresAt: Date | null;
  isExpired: boolean;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// --- Fit assessment (TASK-079) ---------------------------------------------
//
// Nine weighted criteria replace the single match_score prompt output.
// coreStack, industry, workMode and salary are computed mechanically in
// TypeScript from the owner's job preferences (see mechanical-subscores.ts)
// and handed to the model as given facts; the other five need judgment and
// are scored by the AI call. match_score itself stays the weighted average
// of whichever of the nine are known, rounded to an integer, so every
// screen that already reads match_score keeps working unchanged.
export const fitCriterionKeys = [
  'technicalMatch',
  'seniorityMatch',
  'coreStack',
  'industry',
  'workMode',
  'salary',
  'architectureExperience',
  'companyAttractiveness',
  'experienceSimilarity',
] as const;

export type FitCriterionKey = (typeof fitCriterionKeys)[number];

// Fixed weights summing to 100 (do not change without updating ADR-019).
export const FIT_CRITERION_WEIGHTS: Record<FitCriterionKey, number> = {
  technicalMatch: 20,
  seniorityMatch: 15,
  coreStack: 15,
  industry: 10,
  workMode: 10,
  salary: 10,
  architectureExperience: 10,
  companyAttractiveness: 5,
  experienceSimilarity: 5,
};

// The four mechanical criteria: no AI call, computed from job preferences.
export const MECHANICAL_CRITERION_KEYS = [
  'coreStack',
  'industry',
  'workMode',
  'salary',
] as const satisfies readonly FitCriterionKey[];

export const fitCriterionSchema = z.object({
  // null means the criterion is unknown (e.g. no preference set), never a
  // silent zero.
  score: z.number().int().min(0).max(100).nullable(),
  reasoning: z.string(),
});

export type FitCriterion = z.infer<typeof fitCriterionSchema>;

export const callbackModifierSchema = z.object({
  name: z.string(),
  delta: z.number().int(),
});

export type CallbackModifier = z.infer<typeof callbackModifierSchema>;

export const recommendedActionSchema = z.enum([
  'APPLY_IMMEDIATELY',
  'STRONG_OPPORTUNITY',
  'CONSIDER',
  'IGNORE',
]);

export type RecommendedAction = z.infer<typeof recommendedActionSchema>;

export const fitAssessmentSchema = z.object({
  criteria: z.object({
    technicalMatch: fitCriterionSchema,
    seniorityMatch: fitCriterionSchema,
    coreStack: fitCriterionSchema,
    industry: fitCriterionSchema,
    workMode: fitCriterionSchema,
    salary: fitCriterionSchema,
    architectureExperience: fitCriterionSchema,
    companyAttractiveness: fitCriterionSchema,
    experienceSimilarity: fitCriterionSchema,
  }),
  missingSkills: z.array(z.string()),
  absentButTrue: z.array(z.string()),
  hrCallbackProbability: z.number().int().min(0).max(100),
  callbackModifiers: z.array(callbackModifierSchema),
  recommendedAction: recommendedActionSchema,
});

export type FitAssessment = z.infer<typeof fitAssessmentSchema>;
