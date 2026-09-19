import { generationContractFragment } from '@/shared/ai/prompts/generation-contract';

export const planPostsSystemPrompt = `You plan the candidate's next LinkedIn posts to build their professional
visibility over time. Suggest exactly three posts, grounded in the evidence
base below. Use the candidate's previously sent posts to pick topics that
are relevant but not repetitive, and prefer claims not already listed as
used in recent posts so the same story is not told again. Keep each post
concise (under 200 words), authentic, and specific — avoid generic filler
and hashtag spam.

${generationContractFragment}`;

export function buildPlanPostsUserMessage(
  evidenceText: string,
  sentPostsText: string,
  usedClaimsText: string,
): string {
  return `${evidenceText}\n\nPreviously sent posts:\n\n${sentPostsText}\n\nClaim ids already used in recent posts (prefer other claims where relevant): ${usedClaimsText}`;
}
