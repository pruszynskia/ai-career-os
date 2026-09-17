import 'server-only';

import { z } from 'zod';

import {
  cvDocumentService,
  NoMasterCvError,
} from '@/entities/cv-document/service';
import { getOfferOrThrow } from '@/entities/job-offer/service';
import type {
  OutreachChannel,
  OutreachMessage,
} from '@/entities/outreach-message/types';
import { outreachMessageService } from '@/entities/outreach-message/service';
import { profileService } from '@/entities/profile/service';
import { EMPTY_EVIDENCE_BASE } from '@/entities/profile/types';
import {
  assertEvidenceBase,
  assertValidClaims,
} from '@/shared/ai/claim-validator';
import {
  buildOutreachUserMessage,
  outreachSystemPrompt,
} from '@/shared/ai/prompts/outreach';
import { serializeEvidenceBase } from '@/shared/ai/prompts/generation-contract';
import { assertValidOutreach } from '@/shared/ai/outreach-validator';
import { getMeteredAiService } from '@/shared/ai/service';
import { getOwnerId } from '@/shared/auth/session';

const VARIATION_WINDOW_DAYS = 30;

const draftSchema = z.object({
  body: z.string(),
  claimsUsed: z.array(z.string()),
});

const outreachSchema = z.object({
  connectionNote: draftSchema,
  directMessage: draftSchema,
  email: draftSchema.extend({ subject: z.string() }),
});

// A guessed contact is not a lower-quality output, it is a nonexistent one -
// there is no "contacts" entity yet, so the caller supplies a name per
// generation (see ADR-020) and this is thrown, before any AI call, when it
// doesn't.
export class NoOutreachContactError extends Error {
  constructor(
    public readonly postingUrl: string | null,
    message = "Add the recruiter or hiring contact's name before drafting outreach.",
  ) {
    super(message);
    this.name = 'NoOutreachContactError';
  }
}

export interface OutreachContact {
  name: string;
  profileUrl?: string | null;
}

export async function generateOutreach(
  id: string,
  contact: OutreachContact,
): Promise<{ messages: OutreachMessage[] }> {
  const ownerId = await getOwnerId();
  const offer = await getOfferOrThrow(id);

  // Cheapest check first, before any CV/evidence lookup or AI call: no
  // named contact means no recruiter-addressed draft at all, full stop.
  if (!contact.name.trim()) {
    throw new NoOutreachContactError(offer.url);
  }

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

  const since = new Date();
  since.setUTCDate(since.getUTCDate() - VARIATION_WINDOW_DAYS);
  const recentBodies = await outreachMessageService.findRecentBodies(
    ownerId,
    since,
    offer.id,
  );

  const aiService = await getMeteredAiService('outreach');
  const result = await aiService.generateStructured({
    messages: [
      { role: 'system', content: outreachSystemPrompt },
      {
        role: 'user',
        content: buildOutreachUserMessage(
          serializeEvidenceBase(evidence),
          offer.description,
          contact.name,
          offer.url,
        ),
      },
    ],
    schema: outreachSchema,
    schemaName: 'outreach',
    maxTokens: 2048,
  });

  const drafts: {
    channel: OutreachChannel;
    subject: string | null;
    body: string;
    claimsUsed: string[];
  }[] = [
    { channel: 'CONNECTION_NOTE', subject: null, ...result.connectionNote },
    { channel: 'DIRECT_MESSAGE', subject: null, ...result.directMessage },
    {
      channel: 'EMAIL',
      subject: result.email.subject,
      body: result.email.body,
      claimsUsed: result.email.claimsUsed,
    },
  ];

  for (const draft of drafts) {
    assertValidClaims(evidence, {
      claimsUsed: draft.claimsUsed,
      text: draft.body,
    });
    assertValidOutreach(
      { channel: draft.channel, subject: draft.subject, body: draft.body },
      recentBodies,
    );
  }

  const messages = await outreachMessageService.createMany(
    ownerId,
    offer.id,
    drafts.map((draft) => ({
      channel: draft.channel,
      subject: draft.subject,
      body: draft.body,
      contactName: contact.name,
      contactUrl: contact.profileUrl ?? null,
    })),
  );

  return { messages };
}
