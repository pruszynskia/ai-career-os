import { generationContractFragment } from '@/shared/ai/prompts/generation-contract';

export const recruiterMessageSystemPrompt = `You write a short, personalized message from a candidate to a recruiter
about a specific job offer, suitable for a LinkedIn message or email,
drawing only on the evidence base below. Reference the candidate's relevant
claims and the offer's role and company. Keep it concise (under 150 words),
professional, and specific - avoid generic filler.

${generationContractFragment}`;

export function buildRecruiterMessageUserMessage(
  evidenceText: string,
  offerText: string,
): string {
  return `${evidenceText}\n\nJob offer:\n\n${offerText}`;
}
