'use client';

import type { Post, PostStatus } from '@/entities/post/types';
import { useState } from 'react';

import { EditPostDialog } from '@/features/linkedin-posts/components/edit-post-dialog';
import { useDeletePost } from '@/features/linkedin-posts/hooks/use-delete-post';
import { useMarkPostSent } from '@/features/linkedin-posts/hooks/use-mark-post-sent';
import { useSchedulePost } from '@/features/linkedin-posts/hooks/use-schedule-post';
import { useUpdatePost } from '@/features/linkedin-posts/hooks/use-update-post';
import { AsyncButton } from '@/shared/ui/async-button';
import { Button } from '@/shared/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { EmptyState } from '@/shared/ui/empty-state';
import { Input } from '@/shared/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/primitives/interaction/select/Select';

const POST_STATUSES: PostStatus[] = ['DRAFT', 'SCHEDULED', 'SENT'];

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

export function PostCard({ post }: { post: Post }) {
  const [copied, setCopied] = useState(false);
  const [scheduledAtInput, setScheduledAtInput] = useState('');
  const scheduleMutation = useSchedulePost();
  const markSentMutation = useMarkPostSent();
  const updateMutation = useUpdatePost();
  const deleteMutation = useDeletePost();

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

    scheduleMutation.mutate({
      id: post.id,
      scheduledAt: new Date(scheduledAtInput),
    });
  }

  function handleMarkSent() {
    markSentMutation.mutate(post.id);
  }

  function handleStatusChange(status: PostStatus) {
    updateMutation.mutate({ id: post.id, status });
  }

  function handleDelete() {
    deleteMutation.mutate(post.id);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Select value={post.status} onValueChange={handleStatusChange}>
            <SelectTrigger aria-label="Post status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {POST_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardTitle>
        <CardDescription>
          {post.createdAt.toLocaleDateString()}
          {post.scheduledAt &&
            ` · scheduled for ${post.scheduledAt.toLocaleDateString()}`}
          {post.sentAt && ` · sent ${post.sentAt.toLocaleDateString()}`}
        </CardDescription>
        <CardAction className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          {post.status === 'DRAFT' && <EditPostDialog post={post} />}
          <ConfirmDialog
            trigger={
              <Button variant="destructive" size="sm">
                Delete
              </Button>
            }
            title="Delete this post?"
            description="This can't be undone."
            confirmLabel="Delete"
            pendingLabel="Deleting…"
            pending={deleteMutation.isPending}
            onConfirm={handleDelete}
          />
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
            <AsyncButton
              type="button"
              size="sm"
              disabled={!scheduledAtInput}
              pending={scheduleMutation.isPending}
              pendingLabel="Scheduling…"
              onClick={handleSchedule}
            >
              Schedule
            </AsyncButton>
          </div>
        )}

        {post.status === 'SCHEDULED' && (
          <AsyncButton
            type="button"
            size="sm"
            variant="outline"
            className="self-start"
            pending={markSentMutation.isPending}
            pendingLabel="Marking…"
            onClick={handleMarkSent}
          >
            Mark as sent
          </AsyncButton>
        )}
      </CardContent>
    </Card>
  );
}
