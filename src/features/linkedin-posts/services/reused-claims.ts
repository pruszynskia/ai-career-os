import type { Post } from '@/entities/post/types';

const REUSE_WINDOW_DAYS = 30;

// Claim ids used in more than one post within the last REUSE_WINDOW_DAYS,
// so a post row can flag material it already told once recently (TASK-087)
// before the owner generates another post from the same claim. Windows on
// sentAt when a post has been sent (that's when the story was actually told
// publicly), falling back to createdAt for drafts/scheduled posts.
export function findReusedClaimIds(
  posts: Post[],
  now: Date = new Date(),
): Set<string> {
  const cutoff = new Date(now);
  cutoff.setUTCDate(cutoff.getUTCDate() - REUSE_WINDOW_DAYS);

  const counts = new Map<string, number>();
  for (const post of posts) {
    const referenceDate = post.sentAt ?? post.createdAt;
    if (referenceDate < cutoff) continue;
    // Dedupe per post first - the same post citing a claim twice in its
    // own claimsUsed must not self-flag as "reused".
    for (const claimId of new Set(post.claimsUsed)) {
      counts.set(claimId, (counts.get(claimId) ?? 0) + 1);
    }
  }

  return new Set(
    Array.from(counts.entries())
      .filter(([, count]) => count > 1)
      .map(([claimId]) => claimId),
  );
}
