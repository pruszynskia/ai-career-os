export const recruiterMessageSystemPrompt = `You write a short, personalized message from a candidate to a recruiter
about a specific job offer, suitable for a LinkedIn message or email. Reference
the candidate's relevant skills and experience and the offer's role and
company. Keep it concise (under 150 words), professional, and specific —
avoid generic filler.`;

export function buildRecruiterMessageUserMessage(
  profileText: string,
  offerText: string,
): string {
  return `Candidate profile:\n\n${profileText}\n\nJob offer:\n\n${offerText}`;
}
