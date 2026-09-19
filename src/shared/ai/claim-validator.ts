import type { EvidenceBase } from '@/entities/profile/types';

export interface ClaimValidationInput {
  // Claim ids the generator says it drew on.
  claimsUsed: string[];
  // The generated output text, checked for neverInclude phrases.
  text: string;
}

// Thrown by assertValidClaims so a violating generation is surfaced as a
// clear error rather than persisted or returned to the caller.
export class ClaimValidationError extends Error {
  constructor(public readonly violations: string[]) {
    super(
      `Generation violated the evidence contract: ${violations.join('; ')}`,
    );
    this.name = 'ClaimValidationError';
  }
}

// Thrown by assertEvidenceBase so a profile with no usable claims (never
// parsed, or parsed before ADR-017's evidence base existed) fails before an
// AI call rather than silently generating from "(no claims)" and burning a
// metered quota unit on contentless output.
export class NoEvidenceBaseError extends Error {
  constructor(
    message = 'Add verified claims to your profile before generating this.',
  ) {
    super(message);
    this.name = 'NoEvidenceBaseError';
  }
}

export function assertEvidenceBase(
  evidence: EvidenceBase,
  message?: string,
): void {
  const usable = evidence.claims.filter((claim) => claim.state !== 'EXCLUDED');
  if (usable.length === 0) {
    throw new NoEvidenceBaseError(message);
  }
}

// The TypeScript half of ADR-017's contract: a rule that lives only in a
// prompt is a suggestion, this is the guarantee. Checks claimsUsed against
// the evidence base and the output text against neverInclude, and returns
// every violation found rather than stopping at the first.
export function findClaimViolations(
  evidence: EvidenceBase,
  input: ClaimValidationInput,
): string[] {
  const claimsById = new Map(evidence.claims.map((claim) => [claim.id, claim]));
  const violations: string[] = [];

  for (const id of input.claimsUsed) {
    const claim = claimsById.get(id);
    if (!claim) {
      violations.push(`Unknown claim id cited: ${id}`);
    } else if (claim.state === 'EXCLUDED') {
      violations.push(`Excluded claim cited: ${id}`);
    }
  }

  const lowerText = input.text.toLowerCase();
  for (const phrase of evidence.neverInclude) {
    if (phrase.trim().length > 0 && lowerText.includes(phrase.toLowerCase())) {
      violations.push(`neverInclude phrase present: ${phrase}`);
    }
  }

  // Closes the cheapest way to dodge the contract: cite nothing. If usable
  // claims exist and the model still produced text, it must have grounded
  // at least one claim.
  const usableClaims = evidence.claims.filter(
    (claim) => claim.state !== 'EXCLUDED',
  );
  if (
    usableClaims.length > 0 &&
    input.claimsUsed.length === 0 &&
    input.text.trim().length > 0
  ) {
    violations.push(
      'No claims cited despite a non-empty evidence base and generated text',
    );
  }

  return violations;
}

export function assertValidClaims(
  evidence: EvidenceBase,
  input: ClaimValidationInput,
): void {
  const violations = findClaimViolations(evidence, input);
  if (violations.length > 0) {
    throw new ClaimValidationError(violations);
  }
}
