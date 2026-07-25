'use client';

import type { Post } from '@/entities/post/types';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useMarkPostSent } from '@/features/linkedin-posts/hooks/use-mark-post-sent';
import { useSchedulePost } from '@/features/linkedin-posts/hooks/use-schedule-post';
import { Button } from '@/shared/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { Input } from '@/shared/ui/input';

export function PostList({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return <EmptyState message="No posts yet — generate one above." />;
  }

  return (
    <div className="flex flex-col gap-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

function PostCard({ post }: { post: Post }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [scheduledAtInput, setScheduledAtInput] = useState('');
  const scheduleMutation = useSchedulePost();
  const markSentMutation = useMarkPostSent();

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(post.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard write failed; leave button state unchanged
    }
  }

  function handleSchedule() {
    if (!scheduledAtInput) return;

    scheduleMutation.mutate(
      { id: post.id, scheduledAt: new Date(scheduledAtInput) },
      { onSuccess: () => router.refresh() },
    );
  }

  function handleMarkSent() {
    markSentMutation.mutate(post.id, { onSuccess: () => router.refresh() });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{post.status}</CardTitle>
        <CardDescription>
          {post.createdAt.toLocaleDateString()}
          {post.scheduledAt &&
            ` · scheduled for ${post.scheduledAt.toLocaleDateString()}`}
          {post.sentAt && ` · sent ${post.sentAt.toLocaleDateString()}`}
        </CardDescription>
        <CardAction>
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="whitespace-pre-wrap text-sm">{post.content}</p>

        {post.status === 'DRAFT' && (
          <div className="flex items-center gap-2">
            <Input
              type="date"
              className="w-auto"
              value={scheduledAtInput}
              onChange={(event) => setScheduledAtInput(event.target.value)}
              disabled={scheduleMutation.isPending}
            />
            <Button
              type="button"
              size="sm"
              disabled={scheduleMutation.isPending || !scheduledAtInput}
              onClick={handleSchedule}
            >
              {scheduleMutation.isPending ? 'Scheduling…' : 'Schedule'}
            </Button>
          </div>
        )}

        {post.status === 'SCHEDULED' && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="self-start"
            disabled={markSentMutation.isPending}
            onClick={handleMarkSent}
          >
            {markSentMutation.isPending ? 'Marking…' : 'Mark as sent'}
          </Button>
        )}

        {(scheduleMutation.isError || markSentMutation.isError) && (
          <p role="alert" className="text-sm text-destructive">
            {(scheduleMutation.error ?? markSentMutation.error)?.message}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
