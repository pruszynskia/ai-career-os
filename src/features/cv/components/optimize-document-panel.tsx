'use client';

import type { UseMutationResult } from '@tanstack/react-query';

import type { CvDocument } from '@/entities/cv-document/types';
import { Badge, Text, VStack, surfaceVariants } from '@/shared/ui/primitives';
import { AsyncButton } from '@/shared/ui/async-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { cn } from '@/shared/ui/utils';
import { DocumentEditor } from '@/shared/ui/document-editor';

interface Improvement {
  category: string;
  before: string;
  after: string;
  rationale: string;
}

// Shared by OptimizeCvPanel and OptimizeCoverLetterPanel — both trigger a
// no-arg optimize mutation and render the same improvements list + editor,
// differing only in labels, category vocabulary and the download filename.
export function OptimizeDocumentPanel<TImprovement extends Improvement>({
  title,
  buttonLabel,
  buttonPendingLabel,
  downloadFilename,
  categoryLabel,
  mutation,
}: {
  title: string;
  buttonLabel: string;
  buttonPendingLabel: string;
  downloadFilename: string;
  categoryLabel: Record<string, string>;
  mutation: UseMutationResult<
    { cvDocument: CvDocument; improvements: TImprovement[] },
    Error,
    void
  >;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <AsyncButton
          variant="primary"
          className="self-start"
          pending={mutation.isPending}
          pendingLabel={buttonPendingLabel}
          onClick={() => mutation.mutate()}
        >
          {buttonLabel}
        </AsyncButton>

        {mutation.isSuccess && (
          <VStack gap={3}>
            <div className="flex flex-col">
              {mutation.data.improvements.map((improvement, index) => (
                <div
                  key={index}
                  className={cn(
                    surfaceVariants({ elevation: 'ruled', padding: 'sm' }),
                    'flex flex-col gap-1 last:border-b-0',
                  )}
                >
                  <Badge variant="secondary" className="self-start">
                    {categoryLabel[improvement.category]}
                  </Badge>
                  <Text size="sm">
                    <Text as="span" color="muted">
                      Before:
                    </Text>{' '}
                    <Text as="span" className="line-through">
                      {improvement.before}
                    </Text>
                  </Text>
                  <Text size="sm">
                    <Text as="span" color="muted">
                      After:
                    </Text>{' '}
                    {improvement.after}
                  </Text>
                  <Text size="sm" color="muted">
                    {improvement.rationale}
                  </Text>
                </div>
              ))}
            </div>
            <DocumentEditor
              key={mutation.data.cvDocument.id}
              documentId={mutation.data.cvDocument.id}
              content={mutation.data.cvDocument.content}
              downloadFilename={downloadFilename}
            />
          </VStack>
        )}
      </CardContent>
    </Card>
  );
}
