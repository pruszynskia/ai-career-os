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
the text.

Also extract a claims array: one claim per skill, and one claim per distinct
achievement or scope of responsibility named in an experience or project
description. Each claim has a kind ("skill", "experience" or "project"), the
claim text itself, a sourceRef identifying where it came from (e.g. "skills[2]",
"experience[0]", "projects[1]"), a riskLevel, and a metric. Mark riskLevel
"high" when the claim carries a number, a years-of-experience figure, a
seniority label (e.g. "Senior", "Lead"), or a leadership/ownership scope (e.g.
"led the team", "owned the migration"); mark everything else "low". Set metric
to { value, unit } when the claim states a concrete number (e.g. "reduced
latency by 40%" -> { value: 40, unit: "%" }), otherwise null.`;

export function buildParseCvUserMessage(cvText: string): string {
  return `Here is the CV text:\n\n${cvText}`;
}
