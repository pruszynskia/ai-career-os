import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Text, VStack } from '@/shared/ui/primitives';
import { cn } from '@/shared/ui/utils';

export function UsageMeter({ used, limit }: { used: number; limit: number }) {
  const hasLimit = limit > 0;
  const percent = hasLimit
    ? Math.min(100, Math.round((used / limit) * 100))
    : 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI usage this month</CardTitle>
      </CardHeader>
      <CardContent>
        <VStack gap={2}>
          <Text color="muted" className="font-mono">
            {used} / {limit} AI actions used
          </Text>
          <div
            role="progressbar"
            aria-valuenow={hasLimit ? Math.min(used, limit) : 1}
            aria-valuemin={0}
            aria-valuemax={hasLimit ? limit : 1}
            aria-label="AI actions used this month"
            className="h-1.5 w-full overflow-hidden rounded-sm bg-muted"
          >
            <div
              className={cn(
                'h-full',
                !hasLimit
                  ? 'bg-muted-foreground'
                  : percent >= 100
                    ? 'bg-destructive'
                    : percent >= 80
                      ? 'bg-warning'
                      : 'bg-success',
              )}
              style={{ width: `${percent}%` }}
            />
          </div>
        </VStack>
      </CardContent>
    </Card>
  );
}
