import { z } from 'zod';

// Evidence base (ADR-017): a verified claim per skill/achievement/scope the
// CV parser extracted, so later generators cite claims instead of raw CV
// text. TRUSTED is the parse-time default; only riskLevel "high" claims are
// ever surfaced for owner confirmation.
export const claimStateSchema = z.enum([
  'TRUSTED',
  'CONFIRMED',
  'FLAGGED',
  'EXCLUDED',
]);
export type ClaimState = z.infer<typeof claimStateSchema>;

export const claimRiskLevelSchema = z.enum(['low', 'high']);
export type ClaimRiskLevel = z.infer<typeof claimRiskLevelSchema>;

export const claimKindSchema = z.enum(['skill', 'experience', 'project']);
export type ClaimKind = z.infer<typeof claimKindSchema>;

export const claimMetricSchema = z.object({
  value: z.number(),
  unit: z.string().nullable(),
});
export type ClaimMetric = z.infer<typeof claimMetricSchema>;

// What the CV parser returns per claim, before an id or state is assigned.
export const parsedClaimSchema = z.object({
  kind: claimKindSchema,
  text: z.string(),
  sourceRef: z.string(),
  riskLevel: claimRiskLevelSchema,
  metric: claimMetricSchema.nullable(),
});
export type ParsedClaim = z.infer<typeof parsedClaimSchema>;

export const claimSchema = parsedClaimSchema.extend({
  id: z.string(),
  state: claimStateSchema,
  note: z.string().nullable(),
});
export type Claim = z.infer<typeof claimSchema>;

export const evidenceBaseSchema = z.object({
  claims: z.array(claimSchema),
  neverInclude: z.array(z.string()),
  alwaysIncludeWhenRelevant: z.array(z.string()),
});
export type EvidenceBase = z.infer<typeof evidenceBaseSchema>;

export const EMPTY_EVIDENCE_BASE: EvidenceBase = {
  claims: [],
  neverInclude: [],
  alwaysIncludeWhenRelevant: [],
};

export const parsedProfileSchema = z.object({
  summary: z.string(),
  skills: z.array(z.string()),
  experience: z.array(
    z.object({
      company: z.string(),
      title: z.string(),
      startDate: z.string(),
      endDate: z.string().nullable(),
      description: z.string(),
    }),
  ),
  projects: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      technologies: z.array(z.string()),
      url: z.string().nullable(),
    }),
  ),
  score: z.object({
    overall: z.number().min(0).max(100),
    metrics: z.array(
      z.object({
        label: z.string(),
        score: z.number().min(0).max(100),
        note: z.string(),
      }),
    ),
  }),
  claims: z.array(parsedClaimSchema),
});

export type ParsedProfile = z.infer<typeof parsedProfileSchema>;
export type ParsedProfileExperience = ParsedProfile['experience'][number];
export type ParsedProfileProject = ParsedProfile['projects'][number];
export type ParsedProfileScore = ParsedProfile['score'];

export const workModeSchema = z.enum(['REMOTE', 'HYBRID', 'ONSITE']);
export type WorkMode = z.infer<typeof workModeSchema>;

export const employmentTypeSchema = z.enum([
  'FULL_TIME',
  'PART_TIME',
  'CONTRACT',
  'FREELANCE',
]);
export type EmploymentType = z.infer<typeof employmentTypeSchema>;

export const seniorityLevelSchema = z.enum([
  'JUNIOR',
  'MID',
  'SENIOR',
  'LEAD',
  'PRINCIPAL',
]);
export type SeniorityLevel = z.infer<typeof seniorityLevelSchema>;

export const companySizeSchema = z.enum([
  'STARTUP',
  'SCALEUP',
  'MID_SIZE',
  'ENTERPRISE',
]);
export type CompanySize = z.infer<typeof companySizeSchema>;

export const jobPreferencesSchema = z.object({
  workMode: workModeSchema.nullable(),
  salaryMin: z.number().int().min(0).nullable(),
  salaryMax: z.number().int().min(0).nullable(),
  salaryCurrency: z.string().nullable(),
  specialization: z.string().nullable(),
  employmentType: employmentTypeSchema.nullable(),
  seniority: seniorityLevelSchema.nullable(),
  preferredTechnologies: z.array(z.string()),
  companySize: companySizeSchema.nullable(),
  industries: z.array(z.string()),
  locationPreferences: z.array(z.string()),
});

export type JobPreferences = z.infer<typeof jobPreferencesSchema>;

export const profileSchema = z
  .object({
    id: z.string(),
    ownerId: z.string(),
    summary: z.string(),
    skills: z.array(z.string()),
    experience: z.unknown(),
    projects: z.unknown(),
    score: z.unknown(),
    evidence: evidenceBaseSchema,
    createdAt: z.date(),
    updatedAt: z.date(),
    onboardedAt: z.date().nullable(),
  })
  .extend(jobPreferencesSchema.shape);

export interface Profile extends JobPreferences {
  id: string;
  ownerId: string;
  summary: string;
  skills: string[];
  experience: unknown;
  projects: unknown;
  score: unknown;
  evidence: EvidenceBase;
  createdAt: Date;
  updatedAt: Date;
  onboardedAt: Date | null;
}
