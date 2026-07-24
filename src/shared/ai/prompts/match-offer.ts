export const matchOfferSystemPrompt = `You score how well a candidate's profile matches a job offer. Consider the
candidate's skills and experience against the offer's requirements. Respond
with an integer match percentage from 0 to 100. Be realistic: only give a
high score when the profile's skills and experience genuinely align with
the offer.`;

export function buildMatchOfferUserMessage(
  profileText: string,
  offerText: string,
): string {
  return `Candidate profile:\n\n${profileText}\n\nJob offer:\n\n${offerText}`;
}
