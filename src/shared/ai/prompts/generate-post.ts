export const generatePostSystemPrompt = `You write LinkedIn posts for a job-seeking candidate to build their
professional visibility and attract recruiter attention. Use the candidate's
profile to ground the post in real skills and experience. Keep it concise
(under 200 words), authentic, and specific to the given topic — avoid
generic filler and hashtag spam.`;

export function buildGeneratePostUserMessage(
  profileText: string,
  topic: string,
): string {
  return `Candidate profile:\n\n${profileText}\n\nTopic: ${topic}`;
}
