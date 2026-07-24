import 'server-only';

import { z } from 'zod';

import { postService } from '@/entities/post/service';
import { profileService } from '@/entities/profile/service';
import { parsedProfileSchema } from '@/entities/profile/types';
import {
  buildGeneratePostUserMessage,
  generatePostSystemPrompt,
} from '@/shared/ai/prompts/generate-post';
import { getAiService } from '@/shared/ai/service';
import { getOwnerId } from '@/shared/auth/session';

export class NoProfileError extends Error {
  constructor() {
    super('Upload a CV to build your profile before generating a post.');
    this.name = 'NoProfileError';
  }
}

const generatedPostSchema = z.object({ content: z.string() });

export function buildProfileText(profile: {
  summary: string;
  skills: string[];
  experience: unknown;
}): string {
  const experience = parsedProfileSchema.shape.experience.parse(
    profile.experience,
  );

  const experienceText = experience
    .map((item) => `${item.title} at ${item.company}: ${item.description}`)
    .join('\n');

  return `Summary: ${profile.summary}\n\nSkills: ${profile.skills.join(', ')}\n\nExperience:\n${experienceText}`;
}

export async function generatePost(topic: string) {
  const ownerId = await getOwnerId();
  const profile = await profileService.findUnique(ownerId);

  if (!profile) throw new NoProfileError();

  const { content } = await getAiService().generateStructured({
    messages: [
      { role: 'system', content: generatePostSystemPrompt },
      {
        role: 'user',
        content: buildGeneratePostUserMessage(buildProfileText(profile), topic),
      },
    ],
    schema: generatedPostSchema,
    schemaName: 'generated_post',
  });

  const post = await postService.create({ ownerId, content, status: 'DRAFT' });

  return { post };
}
