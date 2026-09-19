import type { OutreachChannel } from '@/entities/outreach-message/types';

export interface OutreachDraft {
  channel: OutreachChannel;
  subject: string | null;
  body: string;
}

// Thrown by assertValidOutreach so a violating draft is surfaced as a clear
// error rather than persisted or returned to the caller (mirrors
// ClaimValidationError in claim-validator.ts).
export class OutreachValidationError extends Error {
  constructor(public readonly violations: string[]) {
    super(
      `Outreach draft violated the outreach rules: ${violations.join('; ')}`,
    );
    this.name = 'OutreachValidationError';
  }
}

// Length is the product decision here (see TASK-083): the connection note
// and direct message budgets are named in the spec, the email budget is
// this task's own reasonable default for "a short subject and body" - no
// acceptance test pins its exact number.
export const CHANNEL_BUDGETS: Record<
  OutreachChannel,
  { hardMax: number; targetMin: number; targetMax: number }
> = {
  CONNECTION_NOTE: { hardMax: 300, targetMin: 120, targetMax: 180 },
  DIRECT_MESSAGE: { hardMax: 400, targetMin: 200, targetMax: 275 },
  EMAIL: { hardMax: 800, targetMin: 200, targetMax: 500 },
};

export const EMAIL_SUBJECT_HARD_MAX = 78;

// Phrases that mark a message as AI-generated (TASK-083 task list). Checked
// against the produced text in TypeScript - the prompt also asks the model
// to avoid these, but a rule that lives only in a prompt is a suggestion.
export const BAN_LIST = [
  'I hope this message finds you well',
  'I came across your profile',
  'Quick background',
  'A bit about me',
  'I would welcome the chance',
  'leverage',
  'passionate about',
  'excited about the opportunity',
  'strong fit',
  'reach out',
];

// Heuristic ask markers, not NLP-grade intent detection.
// ponytail: naive keyword match, upgrade to a proper sentence classifier if
// the two-ask rule starts producing false positives/negatives in practice.
const ASK_MARKERS = [
  'would you be open',
  'could we',
  'worth a quick',
  'happy to',
  'mind if',
  'open to a',
  'up for a',
  'interested in a quick',
  'do you have time',
  'could you point me',
];

function findBanListHits(text: string): string[] {
  const lower = text.toLowerCase();
  return BAN_LIST.filter((phrase) => lower.includes(phrase.toLowerCase()));
}

// Counts sentences containing an ask marker, not marker occurrences - a
// single ask sentence like "Would you be open to a quick chat?" matches
// both the "would you be open" and "open to a" markers, and counting
// per-marker falsely flagged a single ask as two.
function countAsks(text: string): number {
  const sentences = text.split(/(?<=[.!?])\s+/);
  return sentences.reduce((count, sentence) => {
    const lower = sentence.toLowerCase();
    return (
      count + (ASK_MARKERS.some((marker) => lower.includes(marker)) ? 1 : 0)
    );
  }, 0);
}

function countConnectorEmDashes(text: string): number {
  return (text.match(/—/g) ?? []).length;
}

// A tricolon: three single-word items closed with "and" - the single most
// recognizable AI-generated-prose tell ("fast, reliable, and scalable").
// Items are limited to one word each (rather than up to three) so ordinary
// prose with commas and "and" in it - "Hi Jane, thanks for posting and I
// wanted to ask" - doesn't false-positive; a real tricolon's items are
// short parallel words, not clauses.
// ponytail: naive regex, not a real parallel-structure parser.
const TRICOLON_PATTERN = /\b[\w-]+, [\w-]+,? and [\w-]+\b/i;

function hasTricolon(text: string): boolean {
  return TRICOLON_PATTERN.test(text);
}

function hasBulletedSkillStack(text: string): boolean {
  return /(^|\n)\s*(?:[-*•]|\d+\.)\s+\S/.test(text);
}

// A full signature block: 3+ non-empty lines after a farewell word (name,
// title, company, phone...) rather than the requested single first-name
// sign-off. ponytail: line-count heuristic, not a real address-block parser.
//
// Search from the end, not the first match: an ordinary opening line like
// "Thanks for posting the role" also matches this word list, and matching
// the first occurrence flagged that as the start of a signature block.
// A real sign-off farewell is the close of the message, so only a farewell
// found in the last few lines counts.
const FAREWELL_PATTERN = /\b(regards|sincerely|best|thanks|cheers)\b/i;
const SIGN_OFF_SEARCH_WINDOW = 3;

function hasFullSignatureBlock(text: string): boolean {
  const lines = text.split('\n');
  const farewellIndex = lines
    .map((line, index) => (FAREWELL_PATTERN.test(line) ? index : -1))
    .filter((index) => index !== -1)
    .pop();
  if (farewellIndex === undefined) return false;
  if (lines.length - farewellIndex > SIGN_OFF_SEARCH_WINDOW) return false;
  const remaining = lines
    .slice(farewellIndex)
    .filter((line) => line.trim().length > 0);
  return remaining.length > 2;
}

// --- Variation check (TASK-083) ---------------------------------------------
//
// Derives the opening line, ask sentence and sign-off from a draft body so
// a new draft can be compared against this owner's own recent messages for
// a verbatim collision. Comparison is exact (case-insensitive, trimmed) -
// this catches the model reusing its own template, not near-misses.

export interface OutreachFingerprint {
  openingLine: string;
  askSentence: string | null;
  signOff: string;
}

export function fingerprintOutreach(body: string): OutreachFingerprint {
  const lines = body
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const openingLine = lines[0] ?? '';
  const signOff = lines[lines.length - 1] ?? '';

  const sentences = body.split(/(?<=[.!?])\s+/);
  const askSentenceRaw = sentences.find((sentence) => {
    const lower = sentence.toLowerCase();
    return ASK_MARKERS.some((marker) => lower.includes(marker));
  });

  return {
    openingLine: openingLine.toLowerCase(),
    askSentence: askSentenceRaw?.trim().toLowerCase() ?? null,
    signOff: signOff.toLowerCase(),
  };
}

// Sign-off is deliberately excluded from the collision check: the prompt
// mandates a first-name-only sign-off (see prompts/outreach.ts), so it is
// the same one or two words on every draft this owner ever generates - a
// verbatim match there is the format working as designed, not reused
// template text. Comparing it would reject every draft after the first
// within the 30-day window.
function findVariationViolation(
  candidate: OutreachFingerprint,
  recentBodies: string[],
): string | null {
  for (const body of recentBodies) {
    const recent = fingerprintOutreach(body);
    if (candidate.openingLine && candidate.openingLine === recent.openingLine) {
      return 'Opening line matches one generated in the last 30 days';
    }
    if (candidate.askSentence && candidate.askSentence === recent.askSentence) {
      return 'Ask sentence matches one generated in the last 30 days';
    }
  }
  return null;
}

export function findOutreachViolations(
  draft: OutreachDraft,
  recentBodies: string[],
  // Follow-ups (TASK-086) pass a tighter cap than the channel's own hard
  // max - "shorter than the original" is otherwise only a prompt hint, so
  // a follow-up as long as the original still passed this check.
  maxLength: number = CHANNEL_BUDGETS[draft.channel].hardMax,
): string[] {
  const violations: string[] = [];

  if (draft.body.length > maxLength) {
    violations.push(
      `${draft.channel} body is ${draft.body.length} characters, over the ${maxLength} character budget`,
    );
  }

  if (
    draft.channel === 'EMAIL' &&
    draft.subject &&
    draft.subject.length > EMAIL_SUBJECT_HARD_MAX
  ) {
    violations.push(
      `Email subject is ${draft.subject.length} characters, over the ${EMAIL_SUBJECT_HARD_MAX} character budget`,
    );
  }

  const banHits = findBanListHits(draft.body);
  for (const phrase of banHits) {
    violations.push(`Ban-list phrase present: ${phrase}`);
  }

  if (draft.subject) {
    const subjectBanHits = findBanListHits(draft.subject);
    for (const phrase of subjectBanHits) {
      violations.push(`Ban-list phrase present in subject: ${phrase}`);
    }
  }

  if (countAsks(draft.body) > 1) {
    violations.push('More than one ask in the message');
  }

  if (countConnectorEmDashes(draft.body) > 1) {
    violations.push('More than one em dash used as a connector');
  }

  if (hasTricolon(draft.body)) {
    violations.push('Tricolon (three-item "and" list) reads as generated');
  }

  if (draft.channel === 'DIRECT_MESSAGE' && hasBulletedSkillStack(draft.body)) {
    violations.push('Bulleted skill stack inside a direct message');
  }

  if (hasFullSignatureBlock(draft.body)) {
    violations.push('Full signature block instead of a first-name sign-off');
  }

  const variationViolation = findVariationViolation(
    fingerprintOutreach(draft.body),
    recentBodies,
  );
  if (variationViolation) {
    violations.push(variationViolation);
  }

  return violations;
}

export function assertValidOutreach(
  draft: OutreachDraft,
  recentBodies: string[],
  maxLength?: number,
): void {
  const violations = findOutreachViolations(draft, recentBodies, maxLength);
  if (violations.length > 0) {
    throw new OutreachValidationError(violations);
  }
}
