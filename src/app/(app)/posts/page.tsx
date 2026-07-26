import { postService } from '@/entities/post/service';
import { postCampaignService } from '@/entities/post-campaign/service';
import { CampaignList } from '@/features/linkedin-posts/components/campaign-list';
import { GenerateCampaignForm } from '@/features/linkedin-posts/components/generate-campaign-form';
import { GeneratePostForm } from '@/features/linkedin-posts/components/generate-post-form';
import { PlanPostsButton } from '@/features/linkedin-posts/components/plan-posts-button';
import { PostList } from '@/features/linkedin-posts/components/post-list';
import { getOwnerId } from '@/shared/auth/session';
import { AppPageLayout } from '@/shared/layouts';

export const dynamic = 'force-dynamic';

export default async function PostsPage() {
  const ownerId = await getOwnerId();
  const [posts, campaigns] = await Promise.all([
    postService.findMany({ ownerId }),
    postCampaignService.findMany({ ownerId }),
  ]);
  const standalonePosts = posts.filter((post) => !post.campaignId);

  return (
    <AppPageLayout title="Posts">
      <GenerateCampaignForm />

      <CampaignList campaigns={campaigns} posts={posts} />

      <GeneratePostForm />

      <PlanPostsButton />

      <PostList posts={standalonePosts} />
    </AppPageLayout>
  );
}
