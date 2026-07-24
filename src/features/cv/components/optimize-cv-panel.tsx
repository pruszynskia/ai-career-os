'use client';

import { useOptimizeCv } from '@/features/cv/hooks/use-optimize-cv';
import { downloadTextFile } from '@/shared/utils/download-text-file';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

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
          <div className="flex flex-col gap-3">
            <ul className="list-inside list-disc text-sm">
              {mutation.data.improvements.map((improvement, index) => (
                <li key={index}>{improvement}</li>
              ))}
            </ul>
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}
