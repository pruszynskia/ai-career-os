'use client';

import type { CvImprovement } from '@/features/cv/types';
import { useOptimizeCv } from '@/features/cv/hooks/use-optimize-cv';
import { Badge, Spinner, Text, VStack } from '@/shared/ui/primitives';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { DocumentEditor } from '@/shared/ui/document-editor';

const CATEGORY_LABEL: Record<CvImprovement['category'], string> = {
  'ats-keywords': 'ATS keywords',
  quantification: 'Quantification',
  'action-verbs': 'Action verbs',
  clarity: 'Clarity',
  formatting: 'Formatting',
  other: 'Other',
};

export function OptimizeCvPanel() {
  const mutation = useOptimizeCv();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Optimize CV</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Button
          variant="secondary"
          className="self-start"
          disabled={mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending && <Spinner size="sm" />}
          {mutation.isPending ? 'Optimizing…' : 'Optimize CV'}
        </Button>

        {mutation.isSuccess && (
          <VStack gap={3}>
            <VStack gap={2}>
              {mutation.data.improvements.map((improvement, index) => (
                <Card key={index}>
                  <CardContent className="py-4">
                    <VStack gap={1}>
                      <Badge variant="secondary" className="self-start">
                        {CATEGORY_LABEL[improvement.category]}
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
              downloadFilename="optimized-cv.txt"
            />
          </VStack>
        )}
      </CardContent>
    </Card>
  );
}
