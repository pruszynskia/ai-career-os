'use client';

import { useState } from 'react';

import { useGeneratePost } from '@/features/linkedin-posts/hooks/use-generate-post';
import { AsyncButton } from '@/shared/ui/async-button';
import { Input } from '@/shared/ui/input';

export function GeneratePostForm() {
  const [topic, setTopic] = useState('');
  const mutation = useGeneratePost();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const trimmedTopic = topic.trim();
    if (!trimmedTopic) return;

    mutation.mutate(trimmedTopic, {
      onSuccess: () => setTopic(''),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Input
        placeholder="What do you want to post about?"
        value={topic}
        onChange={(event) => setTopic(event.target.value)}
        disabled={mutation.isPending}
      />

      <AsyncButton
        type="submit"
        disabled={!topic.trim()}
        pending={mutation.isPending}
        pendingLabel="Generating…"
        className="self-start"
      >
        Generate post
      </AsyncButton>
    </form>
  );
}
