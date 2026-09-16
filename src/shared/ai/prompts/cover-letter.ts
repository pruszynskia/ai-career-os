import { generationContractFragment } from '@/shared/ai/prompts/generation-contract';

export const coverLetterSystemPrompt = `You write a professional cover letter tailored to a specific job offer,
drawing only on the evidence base below. Connect the candidate's real
claims to the offer's role and company. Do not invent a recipient name or
address it to anyone specific. Keep it to roughly 250-400 words.

${generationContractFragment}`;

export function buildCoverLetterUserMessage(
  evidenceText: string,
  offerText: string,
): string {
  return `${evidenceText}\n\nJob offer to write the cover letter for:\n\n${offerText}`;
}
