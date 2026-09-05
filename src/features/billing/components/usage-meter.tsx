import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Text, VStack } from '@/shared/ui/primitives';

export function UsageMeter({ used, limit }: { used: number; limit: number }) {
  const percent =
    limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI usage this month</CardTitle>
      </CardHeader>
      <CardContent>
        <VStack gap={2}>
          <Text color="muted">
            {used} / {limit} AI actions used
          </Text>
          <progress
            value={used}
            max={limit}
            className="h-2 w-full"
            aria-label="AI actions used this month"
          >
            {percent}%
          </progress>
        </VStack>
      </CardContent>
    </Card>
  );
}
