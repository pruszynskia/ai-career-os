'use client';

import type { UseMutationResult } from '@tanstack/react-query';

import type { CvDocument } from '@/entities/cv-document/types';
import { Badge, Spinner, Text, VStack } from '@/shared/ui/primitives';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
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
        <Button
          variant="secondary"
          className="self-start"
          disabled={mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending && <Spinner size="sm" />}
          {mutation.isPending ? buttonPendingLabel : buttonLabel}
        </Button>

        {mutation.isSuccess && (
          <VStack gap={3}>
            <VStack gap={2}>
              {mutation.data.improvements.map((improvement, index) => (
                <Card key={index}>
                  <CardContent className="py-4">
                    <VStack gap={1}>
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
                    </VStack>
                  </CardContent>
                </Card>
              ))}
            </VStack>
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
