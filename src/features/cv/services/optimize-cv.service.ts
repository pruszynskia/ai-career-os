import 'server-only';

import { cvDocumentService } from '@/entities/cv-document/service';
import { optimizedCvSchema } from '@/features/cv/types';
import {
  buildOptimizeCvUserMessage,
  optimizeCvSystemPrompt,
} from '@/shared/ai/prompts/optimize-cv';
import { getAiService } from '@/shared/ai/service';
import { SEED_OWNER_ID } from '@/shared/auth/owner';

export class NoMasterCvError extends Error {
  constructor() {
    super('Upload a CV before optimizing it.');
    this.name = 'NoMasterCvError';
  }
}

export async function optimizeCv() {
  const masterCv = await cvDocumentService.findFirst({
    where: { ownerId: SEED_OWNER_ID, isMaster: true },
  });

  if (!masterCv) {
    throw new NoMasterCvError();
  }

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

  const cvDocument = await cvDocumentService.create({
    data: {
      ownerId: SEED_OWNER_ID,
      isMaster: false,
      content: optimizedContent,
    },
  });

  return { cvDocument, improvements };
}
