import { generationContractFragment } from '@/shared/ai/prompts/generation-contract';

export const generateCampaignSystemPrompt = `You generate a themed LinkedIn content campaign for the candidate: a group
of posts spaced over time that build professional visibility around a
single theme, grounded in the evidence base below. Prefer claims not
already listed as used in recent posts so the same story is not told
again. For each post, return its content and a suggested publish date as
an ISO 8601 date (YYYY-MM-DD), starting from the day after the given
current date and spaced according to the requested cadence — every date
must be strictly after the current date.

${generationContractFragment}`;

export function buildGenerateCampaignUserMessage(
  evidenceText: string,
  theme: string,
  postCount: number,
  cadenceDays: number,
  usedClaimsText: string,
): string {
  const today = new Date().toISOString().slice(0, 10);
  return `${evidenceText}\n\nCurrent date: ${today}\n\nCampaign theme: ${theme}\n\nGenerate exactly ${postCount} posts, spaced approximately ${cadenceDays} day(s) apart.\n\nClaim ids already used in recent posts (prefer other claims where relevant): ${usedClaimsText}`;
}
