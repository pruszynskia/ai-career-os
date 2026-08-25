'use client';

import { useState } from 'react';

import { useGeneratePost } from '@/features/linkedin-posts/hooks/use-generate-post';
import { Button } from '@/shared/ui/button';
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

      <Button
        type="submit"
        disabled={mutation.isPending || !topic.trim()}
        className="self-start"
      >
        {mutation.isPending ? 'Generating…' : 'Generate post'}
      </Button>
    </form>
  );
}
