import type { JobPreferences, WorkMode } from '@/entities/profile/types';
import type {
  CallbackModifier,
  FitAssessment,
  FitCriterion,
  RecommendedAction,
} from '@/entities/job-offer/types';
import {
  FIT_CRITERION_WEIGHTS,
  fitCriterionKeys,
  MECHANICAL_CRITERION_KEYS,
} from '@/entities/job-offer/types';

// Keyed off MECHANICAL_CRITERION_KEYS so this type can't silently drift from
// ADR-019's list of the four mechanically-computed criteria.
export type MechanicalSubscores = Record<
  (typeof MECHANICAL_CRITERION_KEYS)[number],
  FitCriterion
>;

function unknown(reasoning: string): FitCriterion {
  return { score: null, reasoning };
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ponytail: plain case-insensitive word-boundary matching against the raw
// posting text, not NLP-grade keyword extraction. Good enough while
// postings are free text; revisit if parse-offer ever extracts a
// structured requirements list. Word boundaries (matching detectWorkMode)
// avoid substring false positives like "Rust" matching inside "trust".
function includesKeyword(text: string, keyword: string): boolean {
  return new RegExp(`\\b${escapeRegExp(keyword)}\\b`, 'i').test(text);
}

function scoreCoreStack(
  preferredTechnologies: string[],
  offerText: string,
): FitCriterion {
  if (preferredTechnologies.length === 0) {
    return unknown('No preferred technologies set on the profile.');
  }

  const matched = preferredTechnologies.filter((tech) =>
    includesKeyword(offerText, tech),
  );
  const score = Math.round(
    (matched.length / preferredTechnologies.length) * 100,
  );

  return {
    score,
    reasoning:
      matched.length > 0
        ? `${matched.length}/${preferredTechnologies.length} preferred technologies mentioned in the posting: ${matched.join(', ')}.`
        : 'None of the preferred technologies appear in the posting.',
  };
}

function scoreIndustry(industries: string[], offerText: string): FitCriterion {
  if (industries.length === 0) {
    return unknown('No preferred industries set on the profile.');
  }

  const matched = industries.filter((industry) =>
    includesKeyword(offerText, industry),
  );

  return {
    score: matched.length > 0 ? 100 : 0,
    reasoning:
      matched.length > 0
        ? `Posting matches preferred industry: ${matched.join(', ')}.`
        : 'Posting does not mention any preferred industry.',
  };
}

// Detects at most one explicit mode from the posting text. Hybrid is
// checked first since "hybrid" postings often also mention "remote" or
// "office" in the same paragraph.
export function detectWorkMode(offerText: string): WorkMode | null {
  if (/\bhybrid\b/i.test(offerText)) return 'HYBRID';
  if (/\bremote\b/i.test(offerText)) return 'REMOTE';
  if (/\bon[- ]?site\b/i.test(offerText) || /\bin[- ]office\b/i.test(offerText))
    return 'ONSITE';
  return null;
}

const WORK_MODE_SCORE: Record<WorkMode, Record<WorkMode, number>> = {
  REMOTE: { REMOTE: 100, HYBRID: 50, ONSITE: 0 },
  HYBRID: { REMOTE: 60, HYBRID: 100, ONSITE: 60 },
  ONSITE: { REMOTE: 0, HYBRID: 50, ONSITE: 100 },
};

function scoreWorkMode(
  preferredWorkMode: WorkMode | null,
  offerText: string,
): FitCriterion {
  if (!preferredWorkMode) {
    return unknown('No work-mode preference set on the profile.');
  }

  const detected = detectWorkMode(offerText);
  if (!detected) {
    return unknown('Posting does not state a work mode.');
  }

  return {
    score: WORK_MODE_SCORE[preferredWorkMode][detected],
    reasoning: `Preference is ${preferredWorkMode}, posting states ${detected}.`,
  };
}

// ponytail: naive range/currency regex, not a structured salary field on
// the offer. Requires both numbers to resolve to >= 1000 so it doesn't pick
// up unrelated ranges like "5-10 years"; upgrade path is a structured
// salary field once parse-offer extracts one. Currency and pay-period
// (monthly vs. annual, offer currency vs. preferences.salaryCurrency) are
// still not reconciled - a wrong-currency or monthly figure can still be
// compared as-is; a real fix needs unit-aware parsing, not more regex.
const SALARY_RANGE_REGEX =
  /(\d[\d,.]*)\s*(k)?\s*(?:-|–|to)\s*(\d[\d,.]*)\s*(k)?/gi;
const CURRENCY_TOKEN = 'PLN|USD|EUR|GBP|zł|\\$|€|£';
const SALARY_SINGLE_REGEX = new RegExp(
  `(?:${CURRENCY_TOKEN})\\s*(\\d[\\d,.]*)\\s*(k)?|(\\d[\\d,.]*)\\s*(k)?\\s*(?:${CURRENCY_TOKEN})`,
  'gi',
);

function parseSalaryNumber(raw: string, kSuffix: boolean): number {
  const value = Number(raw.replace(/[,]/g, ''));
  return kSuffix ? value * 1000 : value;
}

// Collapses space-grouped thousands ("18 000" -> "18000") so the digit
// regexes above see one token instead of splitting on the group separator.
function normalizeGroupedDigits(text: string): string {
  let current = text;
  let next = current.replace(/(\d)[  ](\d{3})\b/g, '$1$2');
  while (next !== current) {
    current = next;
    next = current.replace(/(\d)[  ](\d{3})\b/g, '$1$2');
  }
  return next;
}

export function extractSalaryTop(offerText: string): number | null {
  const normalized = normalizeGroupedDigits(offerText);

  for (const match of normalized.matchAll(SALARY_RANGE_REGEX)) {
    const [, minRaw, minK, maxRaw, maxK] = match;
    const min = parseSalaryNumber(minRaw, Boolean(minK));
    const max = parseSalaryNumber(maxRaw, Boolean(maxK));
    if (!Number.isFinite(min) || !Number.isFinite(max)) continue;

    const top = Math.max(min, max);
    if (top >= 1000) return top;
  }

  // No range found - fall back to a single currency-tagged figure so a
  // disclosed flat salary doesn't get treated as undisclosed.
  for (const match of normalized.matchAll(SALARY_SINGLE_REGEX)) {
    const raw = match[1] ?? match[3];
    const kSuffix = Boolean(match[2] ?? match[4]);
    const value = parseSalaryNumber(raw, kSuffix);
    if (Number.isFinite(value) && value >= 1000) return value;
  }

  return null;
}

function scoreSalary(
  salaryMin: number | null,
  offerText: string,
): FitCriterion {
  if (salaryMin === null) {
    return unknown('No minimum salary preference set on the profile.');
  }

  const top = extractSalaryTop(offerText);
  if (top === null) {
    return unknown('Posting does not disclose a salary range.');
  }

  if (top >= salaryMin) {
    return {
      score: 100,
      reasoning: `Top of the disclosed range (${top}) meets the minimum expectation (${salaryMin}).`,
    };
  }

  const score = Math.max(0, Math.min(100, Math.round((top / salaryMin) * 100)));
  return {
    score,
    reasoning: `Top of the disclosed range (${top}) falls short of the minimum expectation (${salaryMin}).`,
  };
}

// The four mechanical criteria: computed from job preferences and the raw
// posting text, no AI call.
export function computeMechanicalSubscores(
  preferences: JobPreferences,
  offerText: string,
): MechanicalSubscores {
  return {
    coreStack: scoreCoreStack(preferences.preferredTechnologies, offerText),
    industry: scoreIndustry(preferences.industries, offerText),
    workMode: scoreWorkMode(preferences.workMode, offerText),
    salary: scoreSalary(preferences.salaryMin, offerText),
  };
}

// Weighted average of whichever of the nine criteria are known (score !==
// null), renormalized over their weights, rounded to an integer. Never
// rounds a single criterion up to flatter the total - only the average
// itself is rounded.
export function computeMatchScore(criteria: FitAssessment['criteria']): number {
  const known = fitCriterionKeys
    .map((key) => ({
      weight: FIT_CRITERION_WEIGHTS[key],
      score: criteria[key].score,
    }))
    .filter(
      (entry): entry is { weight: number; score: number } =>
        entry.score !== null,
    );

  const totalWeight = known.reduce((sum, entry) => sum + entry.weight, 0);
  if (totalWeight === 0) return 0;

  const weightedSum = known.reduce(
    (sum, entry) => sum + entry.score * entry.weight,
    0,
  );
  return Math.round(weightedSum / totalWeight);
}

export function recommendedActionForScore(
  matchScore: number,
): RecommendedAction {
  if (matchScore >= 90) return 'APPLY_IMMEDIATELY';
  if (matchScore >= 80) return 'STRONG_OPPORTUNITY';
  if (matchScore >= 70) return 'CONSIDER';
  return 'IGNORE';
}

const HIGH_APPLICANT_VOLUME_REGEX =
  /\b(100\+ applicants|hundreds of applicants|high[- ]volume|highly competitive process)\b/i;
const AI_CULTURE_REGEX =
  /\b(LLM|GPT|generative ai|ai-native|ai-first|applied ai)\b/i;
const URGENCY_REGEX =
  /\b(urgent(ly)?|immediate start|asap|start immediately)\b/i;

// Deterministic point modifiers on top of match_score, per ADR-019 - each
// named modifier records why it fired so the fit jsonb stays auditable.
export function computeHrCallbackProbability(params: {
  matchScore: number;
  offerText: string;
  seniorityScore: number | null;
  industryScore: number | null;
}): { hrCallbackProbability: number; callbackModifiers: CallbackModifier[] } {
  const { matchScore, offerText, seniorityScore, industryScore } = params;
  const modifiers: CallbackModifier[] = [];

  const hardYearsGate = seniorityScore !== null && seniorityScore < 40;
  // ponytail: industryScore of 0 means "no preferred industry named in the
  // posting", which also fires for a posting that simply never names any
  // industry (not necessarily a different one). Keyword matching can't
  // tell those apart; upgrade path is the same structured-requirements
  // extraction noted on includesKeyword above.
  const domainGap = industryScore !== null && industryScore === 0;
  if (hardYearsGate && domainGap) {
    modifiers.push({
      name: 'Hard years gate stacked with domain gap',
      delta: -25,
    });
  } else if (hardYearsGate) {
    modifiers.push({ name: 'Hard years gate', delta: -15 });
  }

  if (HIGH_APPLICANT_VOLUME_REGEX.test(offerText)) {
    modifiers.push({
      name: 'High applicant volume with no differentiator',
      delta: -10,
    });
  }

  if (AI_CULTURE_REGEX.test(offerText)) {
    modifiers.push({ name: 'AI-engineering culture signal', delta: 10 });
  }

  if (seniorityScore !== null && seniorityScore >= 90) {
    modifiers.push({ name: 'Flexible seniority band', delta: 8 });
  }

  if (URGENCY_REGEX.test(offerText)) {
    modifiers.push({ name: 'Stated urgency', delta: 5 });
  }

  if (extractSalaryTop(offerText) === null) {
    modifiers.push({ name: 'Undisclosed salary', delta: -10 });
  }

  const raw = matchScore + modifiers.reduce((sum, m) => sum + m.delta, 0);
  return {
    hrCallbackProbability: Math.max(0, Math.min(100, raw)),
    callbackModifiers: modifiers,
  };
}
