'use client';

import { useState } from 'react';

import { useGenerateCampaign } from '@/features/linkedin-posts/hooks/use-generate-campaign';
import { Spinner } from '@/shared/ui/primitives';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

export function GenerateCampaignForm() {
  const [theme, setTheme] = useState('');
  const [postCount, setPostCount] = useState('3');
  const [cadenceDays, setCadenceDays] = useState('3');
  const mutation = useGenerateCampaign();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const trimmedTheme = theme.trim();
    if (!trimmedTheme) return;

    mutation.mutate(
      {
        theme: trimmedTheme,
        postCount: Number(postCount),
        cadenceDays: Number(cadenceDays),
      },
      { onSuccess: () => setTheme('') },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Input
        placeholder="What's the campaign theme?"
        value={theme}
        onChange={(event) => setTheme(event.target.value)}
        disabled={mutation.isPending}
      />

      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 text-sm">
          Posts
          <Input
            type="number"
            min={1}
            max={10}
            className="w-20"
            value={postCount}
            onChange={(event) => setPostCount(event.target.value)}
            disabled={mutation.isPending}
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          Every (days)
          <Input
            type="number"
            min={1}
            max={30}
            className="w-20"
            value={cadenceDays}
            onChange={(event) => setCadenceDays(event.target.value)}
            disabled={mutation.isPending}
          />
        </label>
      </div>

      <Button
        type="submit"
        disabled={mutation.isPending || !theme.trim()}
        className="self-start"
      >
        {mutation.isPending && <Spinner size="sm" />}
        {mutation.isPending ? 'Generating…' : 'Generate campaign'}
      </Button>
    </form>
  );
}
