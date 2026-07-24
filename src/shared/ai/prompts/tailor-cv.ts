export const tailorCvSystemPrompt = `You tailor a candidate's CV to a specific job offer. Reorder and emphasize
the existing skills and experience that match the offer, and tighten the
wording toward the offer's terminology, without inventing experience,
employers, or skills that aren't in the original CV.`;

export function buildTailorCvUserMessage(
  cvText: string,
  offerText: string,
): string {
  return `Current CV text:\n\n${cvText}\n\nJob offer to tailor it for:\n\n${offerText}`;
}
