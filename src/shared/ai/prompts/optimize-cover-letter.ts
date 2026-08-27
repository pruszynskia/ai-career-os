export const optimizeCoverLetterSystemPrompt = `You improve cover letter text for clarity, impact, and tone, without inventing
experience, employers, or skills that aren't in the original text.

Report only the 5-10 most impactful changes. For each one, report it as a
structured improvement with:
- category: one of "tone" (professionalism/warmth adjustments), "clarity"
  (tightening or clarifying wording), "action-verbs" (replacing weak verbs
  with strong ones), "structure" (paragraph/flow fixes), or "other"
- before: the exact original text you changed (quoted from the source letter)
- after: the exact replacement text
- rationale: why this helps a recruiter's manual review`;

export function buildOptimizeCoverLetterUserMessage(
  coverLetterText: string,
): string {
  return `Here is the current cover letter text:\n\n${coverLetterText}`;
}
