import { describe, expect, it } from 'vitest';

import { cn } from './utils';

describe('cn', () => {
  it('does not drop a custom text-size token when merged with a color class', () => {
    // Regression guard: tailwind-merge's default `text-color` group is a
    // catch-all, so text-body-sm was being classified as a color and
    // dropped whenever text-foreground was present in the same call.
    expect(cn('text-body-sm', 'text-foreground')).toBe(
      'text-body-sm text-foreground',
    );
  });
});
