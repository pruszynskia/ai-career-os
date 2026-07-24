export const planPostsSystemPrompt = `You plan the candidate's next LinkedIn posts to build their professional
visibility over time. Suggest exactly three posts. Use the candidate's
profile and their previously sent posts (if any) to pick topics that are
relevant but not repetitive of what they already posted. Keep each post
concise (under 200 words), authentic, and specific — avoid generic filler
and hashtag spam.`;

export function buildPlanPostsUserMessage(
  profileText: string,
  sentPostsText: string,
): string {
  return `Candidate profile:\n\n${profileText}\n\nPreviously sent posts:\n\n${sentPostsText}`;
}
