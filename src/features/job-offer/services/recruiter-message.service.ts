import 'server-only';

import { z } from 'zod';

import { cvDocumentService, NoMasterCvError } from '@/entities/cv-document/service';
import { getOfferOrThrow } from '@/entities/job-offer/service';
import { profileService } from '@/entities/profile/service';
import { EMPTY_EVIDENCE_BASE } from '@/entities/profile/types';
import { assertEvidenceBase, assertValidClaims } from '@/shared/ai/claim-validator';
import {
  buildRecruiterMessageUserMessage,
  recruiterMessageSystemPrompt,
} from '@/shared/ai/prompts/recruiter-message';
import { serializeEvidenceBase } from '@/shared/ai/prompts/generation-contract';
import { getMeteredAiService } from '@/shared/ai/service';
import { getOwnerId } from '@/shared/auth/session';

const recruiterMessageSchema = z.object({
  message: z.string(),
  claimsUsed: z.array(z.string()),
});

export async function generateRecruiterMessage(id: string) {
  const ownerId = await getOwnerId();
  const offer = await getOfferOrThrow(id);
  // Existence-only gate - kept so an offer without any uploaded CV still
  // surfaces NoMasterCvError; its content is no longer what the generator
  // reads (ADR-017).
  if (!(await cvDocumentService.existsMaster(ownerId))) {
    throw new NoMasterCvError('Upload a CV before using it for this offer.');
  }
  const profile = await profileService.findUnique(ownerId);
  const evidence = profile?.evidence ?? EMPTY_EVIDENCE_BASE;
  // A profile with no usable claims (never parsed, or parsed before
  // ADR-017's evidence base existed) would otherwise generate from
  // "(no claims)" and still burn a metered quota unit.
  assertEvidenceBase(evidence);

  const aiService = await getMeteredAiService('recruiter_message');
  const result = await aiService.generateStructured({
    messages: [
      { role: 'system', content: recruiterMessageSystemPrompt },
      {
        role: 'user',
        content: buildRecruiterMessageUserMessage(
          serializeEvidenceBase(evidence),
          offer.description,
        ),
      },
    ],
    schema: recruiterMessageSchema,
    schemaName: 'recruiter_message',
  });

  assertValidClaims(evidence, {
    claimsUsed: result.claimsUsed,
    text: result.message,
  });

  return result;
}
