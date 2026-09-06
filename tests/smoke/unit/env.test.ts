import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { parseEnv } from '../../../src/shared/env';

const schema = z.object({
  NEXT_PUBLIC_STORAGE_SUPABASE_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_STORAGE_SUPABASE_SUPABASE_ANON_KEY: z.string().min(1),
});

describe('parseEnv', () => {
  it('returns the typed object when every variable is present and valid', () => {
    const parsed = parseEnv(schema, {
      NEXT_PUBLIC_STORAGE_SUPABASE_SUPABASE_URL: 'https://x.supabase.co',
      NEXT_PUBLIC_STORAGE_SUPABASE_SUPABASE_ANON_KEY: 'anon',
    });

    expect(parsed.NEXT_PUBLIC_STORAGE_SUPABASE_SUPABASE_URL).toBe(
      'https://x.supabase.co',
    );
  });

  it('throws a message naming each missing variable', () => {
    expect(() => parseEnv(schema, {})).toThrow(
      /NEXT_PUBLIC_STORAGE_SUPABASE_SUPABASE_URL/,
    );
    expect(() => parseEnv(schema, {})).toThrow(
      /NEXT_PUBLIC_STORAGE_SUPABASE_SUPABASE_ANON_KEY/,
    );
  });

  it('throws when a variable is present but invalid', () => {
    expect(() =>
      parseEnv(schema, {
        NEXT_PUBLIC_STORAGE_SUPABASE_SUPABASE_URL: 'not-a-url',
        NEXT_PUBLIC_STORAGE_SUPABASE_SUPABASE_ANON_KEY: 'anon',
      }),
    ).toThrow(/Invalid environment variables/);
  });
});
