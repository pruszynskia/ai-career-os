import { postService } from '@/entities/post/service';
import { postCampaignService } from '@/entities/post-campaign/service';
import { profileService } from '@/entities/profile/service';
import { CampaignList } from '@/features/linkedin-posts/components/campaign-list';
import { GenerateCampaignForm } from '@/features/linkedin-posts/components/generate-campaign-form';
import { GeneratePostForm } from '@/features/linkedin-posts/components/generate-post-form';
import { PlanPostsButton } from '@/features/linkedin-posts/components/plan-posts-button';
import { PostList } from '@/features/linkedin-posts/components/post-list';
import { findReusedClaimIds } from '@/features/linkedin-posts/services/reused-claims';
import { getOwnerId } from '@/shared/auth/session';
import { AppPageLayout } from '@/shared/layouts';

export const dynamic = 'force-dynamic';

export default async function PostsPage() {
  const ownerId = await getOwnerId();
  const [posts, campaigns, profile] = await Promise.all([
    postService.findMany({ ownerId }),
    postCampaignService.findMany({ ownerId }),
    profileService.findUnique(ownerId),
  ]);
  const standalonePosts = posts.filter((post) => !post.campaignId);
  // Reuse is computed over every post the owner has, not just the ones in
  // one list - a claim repeated across a campaign is reuse too.
  const reusedClaimIds = findReusedClaimIds(posts);
  // Claim ids in claimsUsed are opaque uuids - resolve them to the evidence
  // text the owner actually recognizes.
  const claimTextById = new Map(
    (profile?.evidence.claims ?? []).map((claim) => [claim.id, claim.text]),
  );

  return (
    <AppPageLayout title="Posts">
      <GenerateCampaignForm />

      <CampaignList
        campaigns={campaigns}
        posts={posts}
        reusedClaimIds={reusedClaimIds}
        claimTextById={claimTextById}
      />

      <GeneratePostForm />

      <PlanPostsButton />

      <PostList
        posts={standalonePosts}
        reusedClaimIds={reusedClaimIds}
        claimTextById={claimTextById}
      />
    </AppPageLayout>
  );
}
