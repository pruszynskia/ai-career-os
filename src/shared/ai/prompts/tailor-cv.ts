import { generationContractFragment } from '@/shared/ai/prompts/generation-contract';

export const tailorCvSystemPrompt = `You tailor a candidate's CV to a specific job offer. Reorder, emphasize and
tighten wording toward the offer's terminology, drawing only on the evidence
base below.

${generationContractFragment}`;

export function buildTailorCvUserMessage(
  evidenceText: string,
  offerText: string,
): string {
  return `${evidenceText}\n\nJob offer to tailor the CV for:\n\n${offerText}`;
}
