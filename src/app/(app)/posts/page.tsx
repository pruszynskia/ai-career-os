import { postService } from '@/entities/post/service';
import { GeneratePostForm } from '@/features/linkedin-posts/components/generate-post-form';
import { PlanPostsButton } from '@/features/linkedin-posts/components/plan-posts-button';
import { PostList } from '@/features/linkedin-posts/components/post-list';
import { getOwnerId } from '@/shared/auth/session';
import { AppPageLayout } from '@/shared/layouts';

export const dynamic = 'force-dynamic';

export default async function PostsPage() {
  const ownerId = await getOwnerId();
  const posts = await postService.findMany({ ownerId });

  return (
    <AppPageLayout title="Posts">
      <GeneratePostForm />

      <PlanPostsButton />

      <PostList posts={posts} />
    </AppPageLayout>
  );
}
