import type { PostStatus } from '@/entities/post/types';

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
import { Card, CardContent } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/ui/primitives';

export const dynamic = 'force-dynamic';

// 'all' isn't a real PostStatus - it's the unfiltered view, kept out of
// entities/post/types.ts so that file stays the single source of truth for
// real status values.
const STATUS_FILTERS: { value: PostStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'SENT', label: 'Sent' },
];

export default async function PostsPage() {
  const ownerId = await getOwnerId();
  const [posts, campaigns, profile] = await Promise.all([
    postService.findMany({ ownerId }),
    postCampaignService.findMany({ ownerId }),
    profileService.findUnique(ownerId),
  ]);
  // Reuse is computed over every post the owner has, not just the ones in
  // one list - a claim repeated across a campaign is reuse too.
  const reusedClaimIds = findReusedClaimIds(posts);
  // Claim ids in claimsUsed are opaque uuids - resolve them to the evidence
  // text the owner actually recognizes.
  const claimTextById = new Map(
    (profile?.evidence.claims ?? []).map((claim) => [claim.id, claim.text]),
  );

  return (
    <AppPageLayout
      title="Posts"
      subtitle="LinkedIn posts generated from your verified record."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="min-w-0">
          <Tabs defaultValue="all">
            <TabsList aria-label="Filter posts">
              {STATUS_FILTERS.map((filter) => (
                <TabsTrigger key={filter.value} value={filter.value}>
                  {filter.label}{' '}
                  <span data-slot="tabs-count">
                    {filter.value === 'all'
                      ? posts.length
                      : posts.filter((post) => post.status === filter.value)
                          .length}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
            {STATUS_FILTERS.map((filter) => {
              // Computed per tab from the posts/campaigns already fetched
              // above - no new query per status.
              const filteredPosts =
                filter.value === 'all'
                  ? posts
                  : posts.filter((post) => post.status === filter.value);
              const standalonePosts = filteredPosts.filter(
                (post) => !post.campaignId,
              );

              return (
                <TabsContent
                  key={filter.value}
                  value={filter.value}
                  className="flex flex-col gap-6 pt-4"
                >
                  {filteredPosts.length === 0 ? (
                    <EmptyState message="No posts yet. Generate one from the rail." />
                  ) : (
                    <>
                      <CampaignList
                        campaigns={campaigns}
                        posts={filteredPosts}
                        reusedClaimIds={reusedClaimIds}
                        claimTextById={claimTextById}
                      />
                      <PostList
                        posts={standalonePosts}
                        reusedClaimIds={reusedClaimIds}
                        claimTextById={claimTextById}
                      />
                    </>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        </div>

        <aside className="flex flex-col gap-4">
          <Card>
            <CardContent className="pt-4">
              <Tabs defaultValue="single">
                <TabsList aria-label="Create">
                  <TabsTrigger value="single">Single post</TabsTrigger>
                  <TabsTrigger value="campaign">Campaign</TabsTrigger>
                </TabsList>
                <TabsContent value="single" className="pt-4">
                  <GeneratePostForm />
                </TabsContent>
                <TabsContent value="campaign" className="pt-4">
                  <GenerateCampaignForm />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <PlanPostsButton />
        </aside>
      </div>
    </AppPageLayout>
  );
}
