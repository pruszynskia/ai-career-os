import { z } from 'zod';

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
    createdAt: z.date(),
    updatedAt: z.date(),
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
  createdAt: Date;
  updatedAt: Date;
}
