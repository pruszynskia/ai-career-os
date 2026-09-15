import type { FitCriterion } from '@/entities/job-offer/types';

// Four of the nine fit criteria - coreStack, industry, workMode and salary -
// are computed mechanically in TypeScript (see mechanical-subscores.ts) and
// handed to this prompt as given facts. This call scores only the five
// criteria that genuinely need judgment.
export const matchOfferSystemPrompt = `You score how well a candidate's profile matches a job offer, on five
criteria only. The other four criteria - core stack overlap, industry
relevance, work-mode compatibility and salary match - have already been
computed from the candidate's stated preferences and are given to you as
facts below. Do not re-score them and do not let them change the five
scores you do produce.

Score each of the following from 0 to 100, with a short reasoning for each:
- technicalMatch: how well the candidate's skills and experience cover the
  offer's technical requirements.
- seniorityMatch: how well the candidate's level fits the offer's stated
  seniority. Apply these bands exactly:
  - a posting stating a flexible band (e.g. "Mid to Senior", "Mid/Senior")
    scores 90 to 100
  - a posting labelled Mid, or a Senior posting using preferred/nice-to-have
    language for its years requirement, scores 70 to 89
  - a posting with an explicit hard years-of-experience gate (a required
    minimum the candidate does not meet) scores 0 to 39, even when the stack
    matches well
- architectureExperience: how well the candidate's experience shows the
  system-design and architecture depth the offer implies.
- companyAttractiveness: how attractive the company and role look on their
  own merits (product, stage, mission), independent of the candidate's fit.
- experienceSimilarity: how similar the candidate's past roles are to this
  one in scope and day-to-day work.

Be realistic: only give a high score when the profile genuinely supports it.
Never round a score up to make the overall picture look better - nine honest
parts are the point.

Also return:
- missingSkills: requirements the posting names that the candidate's profile
  does not show at all.
- absentButTrue: requirements the posting names that show up in the
  candidate's structured experience list below but are not present in their
  structured skills list - things they have demonstrably done but never
  labelled. Judge this against the skills list and experience list given
  below, not against the free-form CV text.`;

export function buildMatchOfferUserMessage(
  profileText: string,
  offerText: string,
  mechanicalFacts: {
    coreStack: FitCriterion;
    industry: FitCriterion;
    workMode: FitCriterion;
    salary: FitCriterion;
  },
  profileEvidence: {
    skills: string[];
    experience: unknown;
  },
): string {
  const factLine = (label: string, criterion: FitCriterion) =>
    `- ${label}: ${criterion.score === null ? 'unknown' : criterion.score} (${criterion.reasoning})`;

  return `Candidate profile:\n\n${profileText}\n\nCandidate skills list (explicit skills only):\n${JSON.stringify(
    profileEvidence.skills,
  )}\n\nCandidate structured experience (evidence base for absentButTrue):\n${JSON.stringify(
    profileEvidence.experience,
  )}\n\nJob offer:\n\n${offerText}\n\nAlready-computed facts, do not recompute:\n${factLine(
    'coreStack',
    mechanicalFacts.coreStack,
  )}\n${factLine('industry', mechanicalFacts.industry)}\n${factLine(
    'workMode',
    mechanicalFacts.workMode,
  )}\n${factLine('salary', mechanicalFacts.salary)}`;
}
