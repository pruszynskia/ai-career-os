import type { TailoringReport as TailoringReportData } from '@/entities/cv-document/types';

import { ListRow } from '@/shared/ui/list-row';
import { StatCard } from '@/shared/ui/stat-card';
import { Badge, Heading, Text, VStack } from '@/shared/ui/primitives';

// Rendered beside the tailored CV in the document editor (TASK-082). Every
// verdict here comes from a mechanical string check, not the model that
// just wrote the CV - that's the point of the report.
export function TailoringReport({ report }: { report: TailoringReportData }) {
  return (
    <section className="flex flex-col gap-4">
      <Heading level={5} as="h3">
        Tailoring report
      </Heading>

      <StatCard
        label="Keyword coverage"
        value={`${report.coveredCount}/${report.totalCount}`}
      />

      {report.keywords.length > 0 && (
        <VStack gap={0}>
          {report.keywords.map((keyword) => (
            <ListRow
              key={keyword.keyword}
              title={keyword.keyword}
              supporting={
                keyword.covered
                  ? keyword.evidenceClaimId
                    ? `Evidenced by claim ${keyword.evidenceClaimId}`
                    : (keyword.matchedSpan ?? undefined)
                  : undefined
              }
              meta={
                <Badge variant={keyword.covered ? 'success' : 'outline'}>
                  {keyword.covered ? 'Covered' : 'Missed'}
                </Badge>
              }
            />
          ))}
        </VStack>
      )}

      <VStack gap={2}>
        <Heading level={6} as="h4" className="text-muted-foreground">
          Gaps
        </Heading>
        {report.gaps.length > 0 ? (
          <ul className="list-disc pl-5 text-sm">
            {report.gaps.map((gap) => (
              <li key={gap}>{gap}</li>
            ))}
          </ul>
        ) : (
          <Text size="sm" color="muted">
            None.
          </Text>
        )}
      </VStack>
    </section>
  );
}
