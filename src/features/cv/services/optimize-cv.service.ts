import 'server-only';

import { cvDocumentService } from '@/entities/cv-document/service';
import { optimizedCvSchema } from '@/features/cv/types';
import {
  buildOptimizeCvUserMessage,
  optimizeCvSystemPrompt,
} from '@/shared/ai/prompts/optimize-cv';
import { getAiService } from '@/shared/ai/service';
import { getOwnerId } from '@/shared/auth/session';

export async function optimizeCv() {
  const ownerId = await getOwnerId();
  const masterCv = await cvDocumentService.getMasterOrThrow(
    ownerId,
    'Upload a CV before optimizing it.',
  );

  const { optimizedContent, improvements } =
    await getAiService().generateStructured({
      messages: [
        { role: 'system', content: optimizeCvSystemPrompt },
        { role: 'user', content: buildOptimizeCvUserMessage(masterCv.content) },
      ],
      schema: optimizedCvSchema,
      schemaName: 'optimized_cv',
      maxTokens: 4096,
    });

  const cvDocument = await cvDocumentService.createVersion({
    ownerId,
    isMaster: false,
    content: optimizedContent,
  });

  return { cvDocument, improvements };
}
