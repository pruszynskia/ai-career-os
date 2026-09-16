import type { Claim, EvidenceBase } from '@/entities/profile/types';

// Composed into every generator's system prompt (ADR-017 / TASK-081) so the
// evidence-grounding rule lives in one shared place instead of drifting
// across tailor-cv, cover-letter and recruiter-message. This fragment tells
// the model the rule; claim-validator.ts is what actually enforces it.
export const generationContractFragment = `You may only draw on the claims listed in "Evidence base" below - never on
any other knowledge, assumption or inference about the candidate. For every
claim you draw on, cite its id in the claimsUsed array you return.

Claim states:
- TRUSTED or CONFIRMED: usable. You may reorder, emphasize or rephrase it,
  but never change what it asserts.
- FLAGGED: never present it as a strength. You may mention it plainly if it
  is relevant, but do not sell it.
- A requirement the offer names with no matching claim in the evidence base:
  state that plainly as a gap. Never write around it or imply it is covered.

Impact rule: a bullet or sentence leads with a metric only when that exact
metric is already recorded on the claim. Never estimate, round, or invent a
number.

Relevance rule: cut a claim whose only justification is that it is true,
rather than that it is relevant to this specific offer.

Verb rule: you may strengthen wording without changing the underlying claim
- "contributed" never becomes "led" because the offer wants a leader. If a
request would require inflating a fact beyond what its claim supports,
decline it and offer the honest alternative instead.`;

function formatClaim(claim: Claim): string {
  const metric = claim.metric
    ? `${claim.metric.value}${claim.metric.unit ?? ''}`
    : 'none';
  return `${claim.id} | ${claim.state} | ${claim.text} | metric: ${metric}`;
}

// Renders the evidence base as the prompt payload every generator reads
// instead of raw CV text. EXCLUDED claims are the owner saying "never use
// this" - they are left out entirely rather than listed as forbidden, so
// there is nothing for a generator to be talked around.
export function serializeEvidenceBase(evidence: EvidenceBase): string {
  const claimLines = evidence.claims
    .filter((claim) => claim.state !== 'EXCLUDED')
    .map(formatClaim)
    .join('\n');

  const sections = [
    `Evidence base (claim id | state | text | metric):\n${claimLines || '(no claims)'}`,
  ];

  if (evidence.alwaysIncludeWhenRelevant.length > 0) {
    sections.push(
      `Always include when relevant: ${evidence.alwaysIncludeWhenRelevant.join('; ')}`,
    );
  }

  if (evidence.neverInclude.length > 0) {
    sections.push(`Never include: ${evidence.neverInclude.join('; ')}`);
  }

  return sections.join('\n\n');
}
