import type { ParsedProfileScore } from '@/entities/profile/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Grid, Heading, Text, VStack } from '@/shared/ui/primitives';
import { StatCard } from '@/shared/ui/stat-card';

export function ProfileScoreCard({ score }: { score: ParsedProfileScore }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>CV Score</CardTitle>
      </CardHeader>
      <CardContent>
        <VStack gap={4}>
          <Heading level={1} as="h2">
            {Math.round(score.overall)}/100
          </Heading>
          <Grid cols={2} colsMd={3} gap={3}>
            {score.metrics.map((metric, index) => (
              <VStack key={`${metric.label}-${index}`} gap={1}>
                <StatCard
                  label={metric.label}
                  value={`${Math.round(metric.score)}/100`}
                />
                <Text size="xs" color="muted">
                  {metric.note}
                </Text>
              </VStack>
            ))}
          </Grid>
        </VStack>
      </CardContent>
    </Card>
  );
}
