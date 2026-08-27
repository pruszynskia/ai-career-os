'use client';

import type { CoverLetterImprovement } from '@/features/cv/types';
import { OptimizeDocumentPanel } from '@/features/cv/components/optimize-document-panel';
import { useOptimizeCoverLetter } from '@/features/cv/hooks/use-optimize-cover-letter';

const CATEGORY_LABEL: Record<CoverLetterImprovement['category'], string> = {
  tone: 'Tone',
  clarity: 'Clarity',
  'action-verbs': 'Action verbs',
  structure: 'Structure',
  other: 'Other',
};

export function OptimizeCoverLetterPanel() {
  const mutation = useOptimizeCoverLetter();

  return (
    <OptimizeDocumentPanel
      title="Optimize Cover Letter"
      buttonLabel="Optimize cover letter"
      buttonPendingLabel="Optimizing…"
      downloadFilename="optimized-cover-letter.txt"
      categoryLabel={CATEGORY_LABEL}
      mutation={mutation}
    />
  );
}
