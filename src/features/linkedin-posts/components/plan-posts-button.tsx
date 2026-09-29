'use client';

import { usePlanPosts } from '@/features/linkedin-posts/hooks/use-plan-posts';
import { Spinner, Text } from '@/shared/ui/primitives';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';

// The composer rail's AI-actions card (TASK-114) - a bordered card of its
// own so it reads as a distinct action from the Single/Campaign generate
// forms above it, not another field in that card.
export function PlanPostsButton() {
  const mutation = usePlanPosts();

  return (
    <Card>
      <CardContent className="flex flex-col gap-2 pt-4">
        <Text size="xs" color="muted">
          Draft the next few posts automatically from your evidence base.
        </Text>
        <Button
          type="button"
          variant="secondary"
          className="self-start"
          disabled={mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending && <Spinner size="sm" />}
          {mutation.isPending ? 'Planning…' : 'Plan next posts'}
        </Button>
      </CardContent>
    </Card>
  );
}
