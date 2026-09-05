import 'server-only';

import { cvDocumentService } from '@/entities/cv-document/service';
import { optimizedCvSchema } from '@/features/cv/types';
import {
  buildOptimizeCvUserMessage,
  optimizeCvSystemPrompt,
} from '@/shared/ai/prompts/optimize-cv';
import { getMeteredAiService } from '@/shared/ai/service';
import { getOwnerId } from '@/shared/auth/session';

export async function optimizeCv() {
  const ownerId = await getOwnerId();
  const masterCv = await cvDocumentService.getMasterOrThrow(
    ownerId,
    'Upload a CV before optimizing it.',
  );

  const aiService = await getMeteredAiService('optimize_cv');
  const { optimizedContent, improvements } = await aiService.generateStructured(
    {
      messages: [
        { role: 'system', content: optimizeCvSystemPrompt },
        { role: 'user', content: buildOptimizeCvUserMessage(masterCv.content) },
      ],
      schema: optimizedCvSchema,
      schemaName: 'optimized_cv',
      maxTokens: 8192,
    },
  );

  const cvDocument = await cvDocumentService.createVersion({
    ownerId,
    isMaster: false,
    content: optimizedContent,
    kind: 'OPTIMIZED',
  });

  return { cvDocument, improvements };
}
