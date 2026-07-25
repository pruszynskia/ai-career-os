'use client';

import { usePlanPosts } from '@/features/linkedin-posts/hooks/use-plan-posts';
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
        {mutation.isPending ? 'Planning…' : 'Plan next posts'}
      </Button>

      {mutation.isError && (
        <p role="alert" className="text-sm text-destructive">
          {mutation.error.message}
        </p>
      )}
    </div>
  );
}
