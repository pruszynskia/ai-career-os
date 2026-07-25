import type { Post } from '@/entities/post/types';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';

export function NextPostCard({ post }: { post: Post | null }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Next scheduled post</CardTitle>
        {post?.scheduledAt && (
          <CardDescription>
            Scheduled for {post.scheduledAt.toLocaleDateString()}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {post ? (
          <p className="line-clamp-3 whitespace-pre-wrap text-sm">
            {post.content}
          </p>
        ) : (
          <EmptyState message="No post scheduled yet." />
        )}
      </CardContent>
    </Card>
  );
}
