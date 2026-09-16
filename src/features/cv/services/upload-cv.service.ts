import 'server-only';

import { cvDocumentService } from '@/entities/cv-document/service';
import type { Claim, EvidenceBase } from '@/entities/profile/types';
import { parsedProfileSchema } from '@/entities/profile/types';
import { profileService } from '@/entities/profile/service';
import {
  buildParseCvUserMessage,
  parseCvSystemPrompt,
} from '@/shared/ai/prompts/parse-cv';
import { getMeteredAiService } from '@/shared/ai/service';
import { getOwnerId } from '@/shared/auth/session';

export async function uploadCv(text: string) {
  const ownerId = await getOwnerId();
  const aiService = await getMeteredAiService('upload_cv');
  const parsed = await aiService.generateStructured({
    messages: [
      { role: 'system', content: parseCvSystemPrompt },
      { role: 'user', content: buildParseCvUserMessage(text) },
    ],
    schema: parsedProfileSchema,
    schemaName: 'parsed_profile',
    // Output now covers summary/skills/experience/projects/score/claims -
    // give thinking models (Gemini) enough budget beyond their reasoning tokens.
    maxTokens: 16384,
  });

  // Re-parsing keeps the owner's own neverInclude/alwaysIncludeWhenRelevant
  // rules; only the claims (which the new CV supersedes) are rebuilt.
  const existing = await profileService.findUnique(ownerId);
  const claims: Claim[] = parsed.claims.map((claim) => ({
    ...claim,
    id: crypto.randomUUID(),
    state: 'TRUSTED',
    note: null,
  }));
  const evidence: EvidenceBase = {
    claims,
    neverInclude: existing?.evidence.neverInclude ?? [],
    alwaysIncludeWhenRelevant:
      existing?.evidence.alwaysIncludeWhenRelevant ?? [],
  };

  const profile = await profileService.upsert(ownerId, { ...parsed, evidence });
  const cvDocument = await cvDocumentService.createVersion({
    ownerId,
    isMaster: true,
    content: text,
    kind: 'MASTER',
  });

  return { profile, cvDocument };
}
