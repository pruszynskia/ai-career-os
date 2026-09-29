'use client';

import type { Post } from '@/entities/post/types';
import { useState } from 'react';

import { useUpdatePost } from '@/features/linkedin-posts/hooks/use-update-post';
import { Spinner, Tag } from '@/shared/ui/primitives';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import { Textarea } from '@/shared/ui/textarea';

export function EditPostDialog({
  post,
  reusedClaimIds,
  claimTextById,
}: {
  post: Post;
  // Same reuse/claim-text data PostCard already computes - passed down
  // instead of recomputed so this dialog can show the same "· reused" tag.
  reusedClaimIds: Set<string>;
  claimTextById: Map<string, string>;
}) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState(post.content);
  const updateMutation = useUpdatePost();

  function handleSubmit() {
    updateMutation.mutate(
      { id: post.id, content: content.trim() },
      { onSuccess: () => setOpen(false) },
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) setContent(post.content);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit post</DialogTitle>
        </DialogHeader>
        <Textarea
          className="resize-none"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={8}
          disabled={updateMutation.isPending}
        />
        <div className="flex flex-wrap items-center gap-2">
          {[...new Set(post.claimsUsed)].map((claimId) => (
            <Tag
              key={claimId}
              title={claimId}
              aria-pressed={reusedClaimIds.has(claimId)}
            >
              {claimTextById.get(claimId) ?? claimId}
              {reusedClaimIds.has(claimId) ? ' · reused' : ''}
            </Tag>
          ))}
          <span className="ml-auto text-xs text-muted-foreground">
            {content.length} characters
          </span>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <Button
            type="button"
            disabled={updateMutation.isPending || !content.trim()}
            onClick={handleSubmit}
          >
            {updateMutation.isPending && <Spinner size="sm" />}
            {updateMutation.isPending ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
