import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Meter, Text, VStack } from '@/shared/ui/primitives';

export function UsageMeter({ used, limit }: { used: number; limit: number }) {
  const hasLimit = limit > 0;

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
          <Meter
            variant="standalone"
            value={hasLimit ? Math.min(used, limit) : 1}
            max={hasLimit ? limit : 1}
            aria-label="AI actions used this month"
          />
        </VStack>
      </CardContent>
    </Card>
  );
}
