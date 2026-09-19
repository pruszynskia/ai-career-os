import { describe, expect, it } from 'vitest';

import type { Post } from '@/entities/post/types';
import { findReusedClaimIds } from '@/features/linkedin-posts/services/reused-claims';

function makePost(overrides: Partial<Post>): Post {
  return {
    id: 'post-1',
    ownerId: 'owner-1',
    content: 'content',
    status: 'SENT',
    scheduledAt: null,
    sentAt: null,
    campaignId: null,
    claimsUsed: [],
    createdAt: new Date('2026-09-01T00:00:00Z'),
    updatedAt: new Date('2026-09-01T00:00:00Z'),
    ...overrides,
  };
}

describe('findReusedClaimIds', () => {
  const now = new Date('2026-09-18T00:00:00Z');

  it('flags a claim used in more than one post within the last 30 days', () => {
    const posts = [
      makePost({ id: 'a', claimsUsed: ['claim_1'] }),
      makePost({ id: 'b', claimsUsed: ['claim_1', 'claim_2'] }),
    ];

    expect(findReusedClaimIds(posts, now)).toEqual(new Set(['claim_1']));
  });

  it('does not flag a claim used only once', () => {
    const posts = [makePost({ id: 'a', claimsUsed: ['claim_1'] })];

    expect(findReusedClaimIds(posts, now)).toEqual(new Set());
  });

  it('does not self-flag a claim cited twice within the same post', () => {
    const posts = [makePost({ id: 'a', claimsUsed: ['claim_1', 'claim_1'] })];

    expect(findReusedClaimIds(posts, now)).toEqual(new Set());
  });

  it('ignores posts older than the 30-day window', () => {
    const posts = [
      makePost({
        id: 'a',
        claimsUsed: ['claim_1'],
        createdAt: new Date('2026-08-01T00:00:00Z'),
      }),
      makePost({ id: 'b', claimsUsed: ['claim_1'] }),
    ];

    expect(findReusedClaimIds(posts, now)).toEqual(new Set());
  });
});
