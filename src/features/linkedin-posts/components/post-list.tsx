'use client';

import type { Post } from '@prisma/client';
import { useState } from 'react';

import { Button } from '@/shared/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';

export function PostList({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No posts yet — generate one above.
      </p>
    );
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
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(post.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard write failed; leave button state unchanged
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{post.status}</CardTitle>
        <CardDescription>
          {post.createdAt.toLocaleDateString()}
        </CardDescription>
        <CardAction>
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap text-sm">{post.content}</p>
      </CardContent>
    </Card>
  );
}
