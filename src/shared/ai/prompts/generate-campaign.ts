export const generateCampaignSystemPrompt = `You generate a themed LinkedIn content campaign for the candidate: a group
of posts spaced over time that build professional visibility around a
single theme. Use the candidate's profile to keep posts authentic and
specific — avoid generic filler and hashtag spam. For each post, return its
content and a suggested publish date as an ISO 8601 date (YYYY-MM-DD),
starting from the day after the given current date and spaced according to
the requested cadence — every date must be strictly after the current date.`;

export function buildGenerateCampaignUserMessage(
  profileText: string,
  theme: string,
  postCount: number,
  cadenceDays: number,
): string {
  const today = new Date().toISOString().slice(0, 10);
  return `Candidate profile:\n\n${profileText}\n\nCurrent date: ${today}\n\nCampaign theme: ${theme}\n\nGenerate exactly ${postCount} posts, spaced approximately ${cadenceDays} day(s) apart.`;
}
