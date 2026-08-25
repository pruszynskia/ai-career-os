'use client';

import { usePlanPosts } from '@/features/linkedin-posts/hooks/use-plan-posts';
import { Spinner } from '@/shared/ui/primitives';
import { Button } from '@/shared/ui/button';

export function PlanPostsButton() {
  const mutation = usePlanPosts();

  return (
    <div className="flex flex-col gap-2 self-start">
      <Button
        type="button"
        variant="outline"
        disabled={mutation.isPending}
        onClick={() => mutation.mutate()}
      >
        {mutation.isPending && <Spinner size="sm" />}
        {mutation.isPending ? 'Planning…' : 'Plan next posts'}
      </Button>
    </div>
  );
}
