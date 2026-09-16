import 'server-only';

import { z } from 'zod';

import type { TailoringReport } from '@/entities/cv-document/types';
import {
  cvDocumentService,
  NoMasterCvError,
} from '@/entities/cv-document/service';
import type { FitAssessment } from '@/entities/job-offer/types';
import { getOfferOrThrow } from '@/entities/job-offer/service';
import { profileService } from '@/entities/profile/service';
import {
  EMPTY_EVIDENCE_BASE,
  type EvidenceBase,
} from '@/entities/profile/types';
import { matchOffer } from '@/features/job-offer/services/match-offer.service';
import {
  assertEvidenceBase,
  assertValidClaims,
} from '@/shared/ai/claim-validator';
import {
  buildTailorCvUserMessage,
  tailorCvSystemPrompt,
} from '@/shared/ai/prompts/tailor-cv';
import { serializeEvidenceBase } from '@/shared/ai/prompts/generation-contract';
import { getMeteredAiService } from '@/shared/ai/service';
import { getOwnerId } from '@/shared/auth/session';

const tailoredCvSchema = z.object({
  content: z.string(),
  claimsUsed: z.array(z.string()),
});

// The keyword-coverage report is built by the document feature
// (keyword-coverage.ts); job-offer cannot import it directly (ADR-008
// feature isolation), so the caller supplies it - the API route composes
// the two features, same as a widget does for UI.
export type BuildTailoringReport = (params: {
  fit: FitAssessment;
  cvText: string;
  evidence: EvidenceBase;
  claimsUsed: string[];
}) => TailoringReport;

export async function tailorCv(id: string, buildReport?: BuildTailoringReport) {
  const ownerId = await getOwnerId();
  let offer = await getOfferOrThrow(id);
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

  const aiService = await getMeteredAiService('tailor_cv');
  const { content, claimsUsed } = await aiService.generateStructured({
    messages: [
      { role: 'system', content: tailorCvSystemPrompt },
      {
        role: 'user',
        content: buildTailorCvUserMessage(
          serializeEvidenceBase(evidence),
          offer.description,
        ),
      },
    ],
    schema: tailoredCvSchema,
    schemaName: 'tailored_cv',
    maxTokens: 4096,
  });

  assertValidClaims(evidence, { claimsUsed, text: content });

  // Reuse the posting keywords TASK-079 already extracted onto fit - fall
  // back to running that same extraction once, only when this offer has
  // never been scored (TASK-082). This runs after the CV is already
  // generated, so a failed/over-quota rescore must not throw away that
  // result - it just means no report this time, not a 500.
  if (!offer.fit) {
    try {
      offer = await matchOffer(offer.id);
    } catch {
      // no-op: tailoredCv persists below without a tailoring report.
    }
  }

  const tailoringReport =
    offer.fit && buildReport
      ? buildReport({ fit: offer.fit, cvText: content, evidence, claimsUsed })
      : undefined;

  return cvDocumentService.createVersion({
    ownerId,
    isMaster: false,
    content,
    jobOfferId: offer.id,
    kind: 'TAILORED',
    tailoringReport,
  });
}
