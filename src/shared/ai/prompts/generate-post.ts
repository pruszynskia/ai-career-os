import { generationContractFragment } from '@/shared/ai/prompts/generation-contract';

export const generatePostSystemPrompt = `You write LinkedIn posts for a job-seeking candidate to build their
professional visibility and attract recruiter attention. Ground the post in
the evidence base below. Keep it concise (under 200 words), authentic, and
specific to the given topic — avoid generic filler and hashtag spam.

${generationContractFragment}`;

export function buildGeneratePostUserMessage(
  evidenceText: string,
  topic: string,
): string {
  return `${evidenceText}\n\nTopic: ${topic}`;
}
