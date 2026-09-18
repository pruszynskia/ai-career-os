import 'server-only';

import { z } from 'zod';

import { postService } from '@/entities/post/service';
import { profileService } from '@/entities/profile/service';
import {
  assertEvidenceBase,
  assertValidClaims,
} from '@/shared/ai/claim-validator';
import {
  buildGeneratePostUserMessage,
  generatePostSystemPrompt,
} from '@/shared/ai/prompts/generate-post';
import { serializeEvidenceBase } from '@/shared/ai/prompts/generation-contract';
import { getMeteredAiService } from '@/shared/ai/service';
import { getOwnerId } from '@/shared/auth/session';

export class NoProfileError extends Error {
  constructor() {
    super('Upload a CV to build your profile before generating a post.');
    this.name = 'NoProfileError';
  }
}

const generatedPostSchema = z.object({
  content: z.string(),
  claimsUsed: z.array(z.string()),
});

export async function generatePost(topic: string) {
  const ownerId = await getOwnerId();
  const profile = await profileService.findUnique(ownerId);

  if (!profile) throw new NoProfileError();
  // A profile with no usable claims (never parsed, or parsed before
  // ADR-017's evidence base existed) would otherwise generate from
  // "(no claims)" and still burn a metered quota unit.
  assertEvidenceBase(profile.evidence);

  const aiService = await getMeteredAiService('generate_post');
  const { content, claimsUsed } = await aiService.generateStructured({
    messages: [
      { role: 'system', content: generatePostSystemPrompt },
      {
        role: 'user',
        content: buildGeneratePostUserMessage(
          serializeEvidenceBase(profile.evidence),
          topic,
        ),
      },
    ],
    schema: generatedPostSchema,
    schemaName: 'generated_post',
  });

  assertValidClaims(profile.evidence, { claimsUsed, text: content });

  const post = await postService.create({
    ownerId,
    content,
    status: 'DRAFT',
    claimsUsed,
  });

  return { post };
}
