export const parseCvSystemPrompt = `You turn raw CV text into a structured profile. Extract a concise
professional summary, a flat list of skills, and the work experience history
(company, title, start date, end date or null if current, and a short
description of the role). Also extract any self-made/personal/side/open-source
projects as a separate projects list, distinct from work experience (name,
short description, technologies used, and an optional URL) - leave this list
empty if the CV has no such section. Also score the CV's overall quality from
0-100, independent of any specific job offer, plus a breakdown of 3-5 metrics
(e.g. completeness, quantified achievements, clarity, keyword coverage), each
with its own 0-100 score and a short note explaining that score. Use the CV's
own wording where possible; do not invent information that isn't present in
the text.`;

export function buildParseCvUserMessage(cvText: string): string {
  return `Here is the CV text:\n\n${cvText}`;
}
