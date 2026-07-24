export const coverLetterSystemPrompt = `You write a professional cover letter tailored to a specific job offer, based
on a candidate's CV. Reference the candidate's real experience and skills
from the CV and connect them to the offer's role and company, without
inventing employers, skills, or achievements that aren't in the CV. Do not
invent a recipient name or address it to anyone specific. Keep it to
roughly 250-400 words.`;

export function buildCoverLetterUserMessage(
  cvText: string,
  offerText: string,
): string {
  return `Candidate CV:\n\n${cvText}\n\nJob offer to write the cover letter for:\n\n${offerText}`;
}
