import { postService } from '@/entities/post/service';
import { GeneratePostForm } from '@/features/linkedin-posts/components/generate-post-form';
import { PlanPostsButton } from '@/features/linkedin-posts/components/plan-posts-button';
import { PostList } from '@/features/linkedin-posts/components/post-list';
import { getOwnerId } from '@/shared/auth/session';

export const dynamic = 'force-dynamic';

export default async function PostsPage() {
  const ownerId = await getOwnerId();
  const posts = await postService.findMany({ ownerId });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Posts</h1>

      <GeneratePostForm />

      <PlanPostsButton />

      <PostList posts={posts} />
    </div>
  );
}
