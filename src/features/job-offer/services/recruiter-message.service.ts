import 'server-only';

import { z } from 'zod';

import { applicationService } from '@/entities/application/service';
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
  buildFollowUpUserMessage,
  buildOutreachUserMessage,
  followUpSystemPrompt,
  outreachSystemPrompt,
} from '@/shared/ai/prompts/outreach';
import { serializeEvidenceBase } from '@/shared/ai/prompts/generation-contract';
import {
  assertValidOutreach,
  CHANNEL_BUDGETS,
} from '@/shared/ai/outreach-validator';
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

// Thrown when the follow-up nudge is drafted for an offer with no tracked
// application - the nudge only ever fires for one (see derive-nudges.ts),
// so this is a defensive guard, not a path a user should be able to reach.
export class NoApplicationError extends Error {
  constructor(
    message = 'Track this offer as an application before drafting a follow-up.',
  ) {
    super(message);
    this.name = 'NoApplicationError';
  }
}

const FOLLOW_UP_SHRINK_FACTOR = 0.5;

// A single, shorter reply-nudge for an offer's follow-up notification
// (TASK-086) - not the three-channel first send generateOutreach produces.
// Replies on whichever channel this owner last used for the offer, falling
// back to email and the application's own recruiter message when no
// outreach-studio draft exists yet for it.
export async function generateFollowUp(
  id: string,
): Promise<{ message: OutreachMessage }> {
  const ownerId = await getOwnerId();
  const offer = await getOfferOrThrow(id);

  const application = await applicationService.findByOffer(ownerId, offer.id);
  if (!application) {
    throw new NoApplicationError();
  }

  if (!(await cvDocumentService.existsMaster(ownerId))) {
    throw new NoMasterCvError('Upload a CV before using it for this offer.');
  }
  const profile = await profileService.findUnique(ownerId);
  const evidence = profile?.evidence ?? EMPTY_EVIDENCE_BASE;
  assertEvidenceBase(evidence);

  const latest = await outreachMessageService.findLatestByJobOffer(
    ownerId,
    offer.id,
  );
  const channel: OutreachChannel = latest?.channel ?? 'EMAIL';
  const originalMessage = latest?.body ?? application.recruiterMessage;
  const contactName = latest?.contactName ?? '';
  const maxChars = Math.round(
    CHANNEL_BUDGETS[channel].hardMax * FOLLOW_UP_SHRINK_FACTOR,
  );

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
      { role: 'system', content: followUpSystemPrompt },
      {
        role: 'user',
        content: buildFollowUpUserMessage(
          serializeEvidenceBase(evidence),
          offer.description,
          contactName,
          originalMessage,
          maxChars,
        ),
      },
    ],
    schema: draftSchema,
    schemaName: 'outreach-follow-up',
    maxTokens: 1024,
  });

  assertValidClaims(evidence, {
    claimsUsed: result.claimsUsed,
    text: result.body,
  });

  // A follow-up on the email channel is still an email - it needs a subject
  // line even when there was no prior outreach-studio draft to reply to
  // (the recruiterMessage fallback above has none of its own).
  const subject = latest?.subject
    ? `Re: ${latest.subject}`
    : channel === 'EMAIL'
      ? `Following up: ${offer.title}`
      : null;

  assertValidOutreach(
    { channel, subject, body: result.body },
    recentBodies,
    maxChars,
  );

  const [message] = await outreachMessageService.createMany(ownerId, offer.id, [
    {
      channel,
      subject,
      body: result.body,
      contactName: latest?.contactName ?? '',
      contactUrl: latest?.contactUrl ?? null,
      parentMessageId: latest?.id ?? null,
    },
  ]);

  return { message };
}
