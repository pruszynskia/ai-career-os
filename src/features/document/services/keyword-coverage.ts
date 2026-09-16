import type { FitAssessment } from '@/entities/job-offer/types';
import type { Claim, EvidenceBase } from '@/entities/profile/types';
import type {
  TailoringReport,
  TailoringReportKeyword,
} from '@/entities/cv-document/types';

// An ATS scan is a literal string match - a skill that is true but phrased
// differently everywhere in the CV still counts as a miss. This whole file
// runs no AI call; the coverage verdict is a mechanical check on text the
// model already produced.

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Case-insensitive, near-literal: a hyphen/space difference (in either
// direction, including none at all - "micro-services" matches
// "microservices") is treated as the same keyword, and a simple plural
// (-s/-es) still counts as covered.
//
// \b relies on a word/non-word transition, which never fires for a keyword
// that starts or ends on a symbol (".NET", "C#", "C++") even when it's
// surrounded by plain spaces - both sides read as "non-word" to \b. Alnum
// lookaround boundaries instead of \b fix that for every keyword shape.
function buildKeywordPattern(keyword: string): RegExp {
  const escaped = escapeRegExp(keyword.trim()).replace(/[\s-]+/g, '[\\s-]*');
  return new RegExp(
    `(?<![A-Za-z0-9])${escaped}(?:es|s)?(?![A-Za-z0-9])`,
    'i',
  );
}

export interface KeywordVerdict {
  keyword: string;
  covered: boolean;
  matchedSpan: string | null;
}

export function checkKeywordCoverage(
  keywords: string[],
  cvText: string,
): KeywordVerdict[] {
  return keywords.map((keyword) => {
    const match = cvText.match(buildKeywordPattern(keyword));
    return {
      keyword,
      covered: match !== null,
      matchedSpan: match ? match[0] : null,
    };
  });
}

// The posting requirements TASK-079 already extracted for this offer - the
// terms it judged missing entirely (missingSkills) or true but never
// labelled (absentButTrue) - deduped and reused rather than re-extracted.
export function derivePostingKeywords(fit: FitAssessment): string[] {
  return Array.from(
    new Set(
      [...fit.missingSkills, ...fit.absentButTrue].filter(
        (keyword) => keyword.trim().length > 0,
      ),
    ),
  );
}

export function buildTailoringReport(params: {
  fit: FitAssessment;
  cvText: string;
  evidence: EvidenceBase;
  claimsUsed: string[];
}): TailoringReport {
  const { fit, cvText, evidence, claimsUsed } = params;
  const keywords = derivePostingKeywords(fit);
  const verdicts = checkKeywordCoverage(keywords, cvText);

  const claimsById = new Map(evidence.claims.map((claim) => [claim.id, claim]));
  const usedClaims = claimsUsed
    .map((id) => claimsById.get(id))
    .filter((claim): claim is Claim => claim !== undefined);

  const keywordReports: TailoringReportKeyword[] = verdicts.map((verdict) => {
    // Evidence trace: join the covered keyword to whichever cited claim's
    // text actually carries it.
    const evidenceClaim = verdict.covered
      ? usedClaims.find((claim) =>
          buildKeywordPattern(verdict.keyword).test(claim.text),
        )
      : undefined;

    return {
      keyword: verdict.keyword,
      covered: verdict.covered,
      matchedSpan: verdict.matchedSpan,
      evidenceClaimId: evidenceClaim?.id ?? null,
    };
  });

  return {
    keywords: keywordReports,
    coveredCount: keywordReports.filter((keyword) => keyword.covered).length,
    totalCount: keywordReports.length,
    // missingSkills is exactly "requirements absent from the evidence
    // base" - absentButTrue is true, just unlabelled, so it never belongs
    // in the gap list.
    gaps: fit.missingSkills.filter((skill) => skill.trim().length > 0),
  };
}
