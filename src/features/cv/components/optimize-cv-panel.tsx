'use client';

import type { CvImprovement } from '@/features/cv/types';
import { OptimizeDocumentPanel } from '@/features/cv/components/optimize-document-panel';
import { useOptimizeCv } from '@/features/cv/hooks/use-optimize-cv';

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
    <OptimizeDocumentPanel
      title="Optimize CV"
      buttonLabel="Optimize CV"
      buttonPendingLabel="Optimizing…"
      downloadFilename="optimized-cv.txt"
      categoryLabel={CATEGORY_LABEL}
      mutation={mutation}
    />
  );
}
