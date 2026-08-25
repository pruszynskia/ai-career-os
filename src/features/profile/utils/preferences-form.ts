import { z } from 'zod';

import {
  companySizeSchema,
  employmentTypeSchema,
  seniorityLevelSchema,
  workModeSchema,
} from '@/entities/profile/types';

export const UNSET = '__unset__';

export const preferencesFormSchema = z
  .object({
    workMode: z.union([workModeSchema, z.literal(UNSET)]),
    salaryMin: z.string(),
    salaryMax: z.string(),
    salaryCurrency: z.string(),
    specialization: z.string(),
    employmentType: z.union([employmentTypeSchema, z.literal(UNSET)]),
    seniority: z.union([seniorityLevelSchema, z.literal(UNSET)]),
    preferredTechnologies: z.string(),
    companySize: z.union([companySizeSchema, z.literal(UNSET)]),
    industries: z.string(),
    locationPreferences: z.string(),
  })
  .superRefine((values, ctx) => {
    const salaryField = z.number().int().min(0);
    let min: number | null = null;
    let max: number | null = null;

    for (const [field, raw] of [
      ['salaryMin', values.salaryMin],
      ['salaryMax', values.salaryMax],
    ] as const) {
      if (!raw.trim()) continue;
      const result = salaryField.safeParse(Number(raw));
      if (!result.success) {
        ctx.addIssue({
          code: 'custom',
          message: 'Must be a whole number of 0 or more.',
          path: [field],
        });
        continue;
      }
      if (field === 'salaryMin') min = result.data;
      else max = result.data;
    }

    if (min !== null && max !== null && min > max) {
      ctx.addIssue({
        code: 'custom',
        message: 'Minimum salary must not exceed maximum salary.',
        path: ['salaryMax'],
      });
    }
  });

export type PreferencesFormValues = z.infer<typeof preferencesFormSchema>;

export function toSelectValue<T extends string>(
  value: T | null,
): T | typeof UNSET {
  return value ?? UNSET;
}

export function fromSelectValue<T extends string>(
  value: T | typeof UNSET,
): T | null {
  return value === UNSET ? null : value;
}

export function toList(value: string): string[] {
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}
