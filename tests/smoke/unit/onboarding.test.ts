import { describe, expect, it, vi } from 'vitest';

// service.ts imports 'server-only'; stub it so the helper can be imported.
// Matches the precedent in entitlements.test.ts / sync-subscription.test.ts.
vi.mock('server-only', () => ({}));

import { clampStep } from '@/app/(app)/onboarding/page';
import { isPlaceholder } from '@/entities/profile/service';
import { isExemptPath } from '@/features/onboarding/components/onboarding-gate';

describe('isPlaceholder', () => {
  it('treats a NULL summary as a placeholder row', () => {
    expect(isPlaceholder({ summary: null })).toBe(true);
    expect(isPlaceholder({ summary: '' })).toBe(false);
    expect(isPlaceholder({ summary: 'real text' })).toBe(false);
  });
});

describe('isExemptPath', () => {
  it('exempts /onboarding and /settings and their subpaths', () => {
    expect(isExemptPath('/onboarding')).toBe(true);
    expect(isExemptPath('/onboarding/x')).toBe(true);
    expect(isExemptPath('/settings')).toBe(true);
    expect(isExemptPath('/dashboard')).toBe(false);
    expect(isExemptPath('/onboardingx')).toBe(false);
  });
});

describe('clampStep', () => {
  it('clamps to the 1..3 step range', () => {
    expect(clampStep(NaN)).toBe(1);
    expect(clampStep(0)).toBe(1);
    expect(clampStep(1)).toBe(1);
    expect(clampStep(2)).toBe(2);
    expect(clampStep(3)).toBe(3);
    expect(clampStep(4)).toBe(3);
    expect(clampStep(2.7)).toBe(2);
  });
});
