import type { ContactClassification } from '@/entities/contact/types';

// Deterministic keyword matcher, no AI call - titles are short and the
// categories are few, so a model call per contact on an import of several
// hundred rows would be waste (ADR-021). Checked most-specific first, so a
// title that could match two categories resolves to the recruiting-specific
// one before the generic manager/head/director/founder bucket.
const NON_IT_KEYWORDS = ['hr business partner', 'people partner'];

const IT_RECRUITER_KEYWORDS = [
  'technical recruiter',
  'tech recruiter',
  'it recruiter',
  'engineering recruiter',
  'technical recruiting',
];

const DECISION_MAKER_KEYWORDS = [
  'engineering lead',
  'manager',
  'head',
  'director',
  'founder',
];

// Word-boundary match, not a plain substring - "head" as a bare substring
// would misclassify a "Headhunter" (a recruiter) as a decision-maker.
function includesKeyword(normalizedTitle: string, keywords: string[]): boolean {
  return keywords.some((keyword) =>
    new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(
      normalizedTitle,
    ),
  );
}

export function classifyTitle(title: string): ContactClassification {
  const normalized = title.toLowerCase();

  if (includesKeyword(normalized, NON_IT_KEYWORDS)) return 'non-it';
  if (includesKeyword(normalized, IT_RECRUITER_KEYWORDS)) return 'it-recruiter';
  if (includesKeyword(normalized, DECISION_MAKER_KEYWORDS))
    return 'decision-maker';

  return 'generalist';
}
