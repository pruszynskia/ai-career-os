import type { TailoringReport as TailoringReportData } from '@/entities/cv-document/types';

import { ListRow } from '@/shared/ui/list-row';
import { StatCard } from '@/shared/ui/stat-card';
import { Heading, Meter, Text, VStack } from '@/shared/ui/primitives';

// Rendered beside the tailored CV in the document editor (TASK-082). Every
// verdict here comes from a mechanical string check, not the model that
// just wrote the CV - that's the point of the report.
export function TailoringReport({ report }: { report: TailoringReportData }) {
  const coveragePercent =
    report.totalCount > 0
      ? Math.round((report.coveredCount / report.totalCount) * 100)
      : 0;

  return (
    <section className="flex flex-col gap-4">
      <Heading level={5} as="h3">
        Tailoring report
      </Heading>

      <VStack gap={2}>
        <StatCard
          label="Keyword coverage"
          value={`${report.coveredCount}/${report.totalCount}`}
        />
        <Meter
          variant="standalone"
          value={coveragePercent}
          aria-label="Keyword coverage"
        />
      </VStack>

      {report.keywords.length > 0 && (
        <VStack gap={0}>
          {report.keywords.map((keyword) => (
            <ListRow
              key={keyword.keyword}
              title={keyword.keyword}
              supporting={
                keyword.covered
                  ? (keyword.matchedSpan ??
                    (keyword.evidenceClaimId
                      ? `Evidenced by claim ${keyword.evidenceClaimId}`
                      : undefined))
                  : undefined
              }
              meta={
                // Tag is neutral-only now (DESIGN-SYSTEM \S4.8) - covered/
                // missed status reads as coloured Text, not a coloured chip.
                <Text
                  as="span"
                  size="xs"
                  weight="medium"
                  color={keyword.covered ? 'success' : 'warning'}
                >
                  {keyword.covered ? 'Covered' : 'Missed'}
                </Text>
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
