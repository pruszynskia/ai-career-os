export const parseCvSystemPrompt = `You turn raw CV text into a structured profile. Extract a concise
professional summary, a flat list of skills, and the work experience history
(company, title, start date, end date or null if current, and a short
description of the role). Use the CV's own wording where possible; do not
invent information that isn't present in the text.`;

export function buildParseCvUserMessage(cvText: string): string {
  return `Here is the CV text:\n\n${cvText}`;
}
