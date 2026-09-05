import 'server-only';

import { cvDocumentService } from '@/entities/cv-document/service';
import { optimizedCoverLetterSchema } from '@/features/cv/types';
import {
  buildOptimizeCoverLetterUserMessage,
  optimizeCoverLetterSystemPrompt,
} from '@/shared/ai/prompts/optimize-cover-letter';
import { getMeteredAiService } from '@/shared/ai/service';
import { getOwnerId } from '@/shared/auth/session';

export async function optimizeCoverLetter() {
  const ownerId = await getOwnerId();
  const masterCoverLetter = await cvDocumentService.getMasterOrThrow(
    ownerId,
    'Upload a cover letter before optimizing it.',
    'COVER_LETTER',
  );

  const aiService = await getMeteredAiService('optimize_cover_letter');
  const { optimizedContent, improvements } = await aiService.generateStructured(
    {
      messages: [
        { role: 'system', content: optimizeCoverLetterSystemPrompt },
        {
          role: 'user',
          content: buildOptimizeCoverLetterUserMessage(
            masterCoverLetter.content,
          ),
        },
      ],
      schema: optimizedCoverLetterSchema,
      schemaName: 'optimized_cover_letter',
      maxTokens: 8192,
    },
  );

  const cvDocument = await cvDocumentService.createVersion({
    ownerId,
    isMaster: false,
    content: optimizedContent,
    kind: 'OPTIMIZED_COVER_LETTER',
  });

  return { cvDocument, improvements };
}
