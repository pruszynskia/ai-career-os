import type { ParsedProfileScore } from '@/entities/profile/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Heading, Meter, Text, surfaceVariants } from '@/shared/ui/primitives';
import { cn } from '@/shared/ui/utils';

export function ProfileScoreCard({ score }: { score: ParsedProfileScore }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>CV Score</CardTitle>
      </CardHeader>
      <CardContent className="px-0 pt-0 pb-0">
        <div className="flex items-baseline gap-1.5 px-4 pb-3">
          <Heading level={1} as="h2" className="tabular-nums">
            {Math.round(score.overall)}
          </Heading>
          <Text size="sm" color="muted">
            /100
          </Text>
        </div>
        <div className="flex flex-col">
          {score.metrics.map((metric, index) => (
            <div
              key={`${metric.label}-${index}`}
              className={cn(
                surfaceVariants({ elevation: 'ruled', padding: 'sm' }),
                'flex flex-col gap-1.5 px-4 last:border-b-0',
              )}
            >
              <div className="flex items-baseline justify-between gap-2">
                <Text size="sm">{metric.label}</Text>
                <Text size="sm" color="muted" className="tabular-nums">
                  {Math.round(metric.score)}
                  <span className="text-xs">/100</span>
                </Text>
              </div>
              <Meter
                variant="inline"
                value={metric.score}
                aria-label={metric.label}
              />
              <Text size="xs" color="muted">
                {metric.note}
              </Text>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
