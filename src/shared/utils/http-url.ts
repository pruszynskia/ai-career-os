import { z } from 'zod';

// z.string().url() accepts javascript: and data: URLs; these values end up in
// href attributes, so only http(s) is allowed.
export const httpUrlSchema = z
  .string()
  .max(2048)
  .refine((value) => /^https?:\/\//i.test(value) && URL.canParse(value), {
    message: 'Enter a valid http(s) URL.',
  });
