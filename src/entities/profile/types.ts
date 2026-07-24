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
});

export type ParsedProfile = z.infer<typeof parsedProfileSchema>;
export type ParsedProfileExperience = ParsedProfile['experience'][number];

export interface Profile {
  id: string;
  ownerId: string;
  summary: string;
  skills: string[];
  experience: unknown;
  createdAt: Date;
  updatedAt: Date;
}
