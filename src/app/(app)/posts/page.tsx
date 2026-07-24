import { postService } from '@/entities/post/service';
import { GeneratePostForm } from '@/features/linkedin-posts/components/generate-post-form';
import { PostList } from '@/features/linkedin-posts/components/post-list';
import { SEED_OWNER_ID } from '@/shared/auth/owner';

export const dynamic = 'force-dynamic';

export default async function PostsPage() {
  const posts = await postService.findMany({
    where: { ownerId: SEED_OWNER_ID },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Posts</h1>

      <GeneratePostForm />

      <PostList posts={posts} />
    </div>
  );
}
