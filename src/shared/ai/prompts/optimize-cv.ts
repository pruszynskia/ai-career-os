export const optimizeCvSystemPrompt = `You improve CV text for clarity, impact, and ATS-friendliness. Rewrite the
CV to use strong action verbs, quantify achievements where the source
supports it, and tighten wording, without inventing experience, employers, or
skills that aren't in the original text. Also list the specific improvements
you made as short bullet points.`;

export function buildOptimizeCvUserMessage(cvText: string): string {
  return `Here is the current CV text:\n\n${cvText}`;
}
