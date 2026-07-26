'use client';

import type { Post } from '@/entities/post/types';
import { useState } from 'react';

import { useUpdatePost } from '@/features/linkedin-posts/hooks/use-update-post';
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

export function EditPostDialog({ post }: { post: Post }) {
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
        <Button variant="outline" size="sm">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit post</DialogTitle>
        </DialogHeader>
        <Textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={8}
          disabled={updateMutation.isPending}
        />
        {updateMutation.isError && (
          <p role="alert" className="text-sm text-destructive">
            {updateMutation.error.message}
          </p>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            type="button"
            disabled={updateMutation.isPending || !content.trim()}
            onClick={handleSubmit}
          >
            {updateMutation.isPending ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
