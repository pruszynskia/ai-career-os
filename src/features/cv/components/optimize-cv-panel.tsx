'use client';

import type { CvImprovement } from '@/features/cv/types';
import { useOptimizeCv } from '@/features/cv/hooks/use-optimize-cv';
import { downloadTextFile } from '@/shared/utils/download-text-file';
import { Badge, Text, VStack } from '@/shared/ui/primitives';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

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
          {mutation.isPending ? 'Optimizing…' : 'Optimize CV'}
        </Button>

        {mutation.isError && (
          <p role="alert" className="text-sm text-destructive">
            {mutation.error.message}
          </p>
        )}

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
            <Button
              variant="outline"
              className="self-start"
              onClick={() =>
                downloadTextFile(
                  'optimized-cv.txt',
                  mutation.data.cvDocument.content,
                )
              }
            >
              Download optimized CV
            </Button>
          </VStack>
        )}
      </CardContent>
    </Card>
  );
}
