import { describe, expect, it } from 'vitest';

import {
  fromSelectValue,
  preferencesFormSchema,
  toList,
  toSelectValue,
  UNSET,
} from '../../../src/features/profile/utils/preferences-form';

const baseValues = {
  workMode: UNSET,
  salaryMin: '',
  salaryMax: '',
  salaryCurrency: '',
  specialization: '',
  employmentType: UNSET,
  seniority: UNSET,
  preferredTechnologies: '',
  companySize: UNSET,
  industries: '',
  locationPreferences: '',
} as const;

describe('toList', () => {
  it('splits on commas, trims entries, and drops empties', () => {
    expect(toList(' TypeScript, React,  , PostgreSQL ')).toEqual([
      'TypeScript',
      'React',
      'PostgreSQL',
    ]);
  });
});

describe('toSelectValue / fromSelectValue', () => {
  it('round-trips null through the unset sentinel', () => {
    expect(toSelectValue(null)).toBe(UNSET);
    expect(fromSelectValue(UNSET)).toBeNull();
  });

  it('round-trips a real value unchanged', () => {
    expect(toSelectValue('REMOTE')).toBe('REMOTE');
    expect(fromSelectValue('REMOTE')).toBe('REMOTE');
  });
});

describe('preferencesFormSchema', () => {
  it('accepts a min salary at or below the max', () => {
    const result = preferencesFormSchema.safeParse({
      ...baseValues,
      salaryMin: '100',
      salaryMax: '150',
    });
    expect(result.success).toBe(true);
  });

  it('rejects a min salary above the max', () => {
    const result = preferencesFormSchema.safeParse({
      ...baseValues,
      salaryMin: '200',
      salaryMax: '150',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['salaryMax']);
    }
  });

  it('rejects a decimal salary with a field-level error', () => {
    const result = preferencesFormSchema.safeParse({
      ...baseValues,
      salaryMin: '1.5',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['salaryMin']);
    }
  });

  it('rejects a negative salary with a field-level error', () => {
    const result = preferencesFormSchema.safeParse({
      ...baseValues,
      salaryMax: '-100',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['salaryMax']);
    }
  });
});
