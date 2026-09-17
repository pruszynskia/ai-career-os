import { describe, expect, it } from 'vitest';

import {
  OutreachValidationError,
  assertValidOutreach,
  findOutreachViolations,
} from './outreach-validator';
import type { OutreachDraft } from './outreach-validator';

const CLEAN_CONNECTION_NOTE: OutreachDraft = {
  channel: 'CONNECTION_NOTE',
  subject: null,
  body:
    'Saw the platform engineer posting at Acme.\n' +
    'I shipped a similar migration off a monolith last year.\n' +
    'Open to a quick chat if useful?\n' +
    'Andrzej',
};

describe('findOutreachViolations', () => {
  it('flags a ban-list phrase', () => {
    const violations = findOutreachViolations(
      {
        ...CLEAN_CONNECTION_NOTE,
        body: 'I hope this message finds you well, Andrzej',
      },
      [],
    );

    expect(
      violations.some((violation) => violation.includes('Ban-list phrase')),
    ).toBe(true);
  });

  it('flags a connection note over the 300 character hard budget', () => {
    const violations = findOutreachViolations(
      { ...CLEAN_CONNECTION_NOTE, body: 'x'.repeat(301) },
      [],
    );

    expect(
      violations.some((violation) =>
        violation.includes('over the 300 character budget'),
      ),
    ).toBe(true);
  });

  it('flags two asks in one message', () => {
    const violations = findOutreachViolations(
      {
        ...CLEAN_CONNECTION_NOTE,
        body: 'Would you be open to a quick chat? Also, could we set up a call this week?',
      },
      [],
    );

    expect(violations).toContain('More than one ask in the message');
  });

  it('flags a 30-day collision on the opening line', () => {
    const violations = findOutreachViolations(CLEAN_CONNECTION_NOTE, [
      CLEAN_CONNECTION_NOTE.body,
    ]);

    expect(
      violations.some((violation) => violation.includes('last 30 days')),
    ).toBe(true);
  });

  it('does not flag a collision on a repeated first-name sign-off alone', () => {
    // Regression: the sign-off is mandated to be the candidate's first
    // name only (prompts/outreach.ts), so it is identical across every
    // draft by design - it must not itself trigger the variation check.
    const violations = findOutreachViolations(
      {
        ...CLEAN_CONNECTION_NOTE,
        body: 'A totally different opening line.\nSomething else in the middle.\nFree for a call?\nAndrzej',
      },
      [CLEAN_CONNECTION_NOTE.body],
    );

    expect(violations).toEqual([]);
  });

  it('does not double-count a single ask whose text matches two markers', () => {
    // Regression: "Would you be open to a quick chat?" matches both
    // "would you be open" and "open to a" - that is one ask, not two.
    const violations = findOutreachViolations(
      {
        ...CLEAN_CONNECTION_NOTE,
        body: 'Saw the posting.\nWould you be open to a quick chat?\nAndrzej',
      },
      [],
    );

    expect(violations).not.toContain('More than one ask in the message');
  });

  it('does not flag a tricolon on ordinary prose with a comma and "and"', () => {
    // Regression: the tricolon heuristic used to match any "X, Y and Z"
    // clause, not just a three single-word parallel list.
    const violations = findOutreachViolations(
      {
        ...CLEAN_CONNECTION_NOTE,
        body: 'Hi Jane, thanks for posting and I wanted to ask about the role.\nAndrzej',
      },
      [],
    );

    expect(
      violations.some((violation) => violation.includes('Tricolon')),
    ).toBe(false);
  });

  it('does not flag a signature block on an early farewell-word opener', () => {
    // Regression: "Thanks for posting the role" is an ordinary opener, not
    // a sign-off - matching the first farewell-word line falsely flagged it
    // as the start of a signature block.
    const violations = findOutreachViolations(
      {
        ...CLEAN_CONNECTION_NOTE,
        body:
          'Thanks for posting the role at Acme.\n' +
          'I shipped a similar migration off a monolith last year.\n' +
          'Open to a quick chat if useful?\n' +
          'Andrzej',
      },
      [],
    );

    expect(
      violations.some((violation) => violation.includes('signature block')),
    ).toBe(false);
  });

  it('flags a real signature block near the end of the message', () => {
    const violations = findOutreachViolations(
      {
        ...CLEAN_CONNECTION_NOTE,
        body:
          'Saw the posting at Acme.\n' +
          'Open to a quick chat if useful?\n' +
          'Best regards,\n' +
          'Andrzej Pruszyński\n' +
          'Senior Engineer, Acme',
      },
      [],
    );

    expect(
      violations.some((violation) => violation.includes('signature block')),
    ).toBe(true);
  });

  it('flags a ban-list phrase in the email subject', () => {
    const violations = findOutreachViolations(
      {
        channel: 'EMAIL',
        subject: 'Strong fit for your platform role',
        body: CLEAN_CONNECTION_NOTE.body,
      },
      [],
    );

    expect(
      violations.some((violation) =>
        violation.includes('Ban-list phrase present in subject'),
      ),
    ).toBe(true);
  });

  it('passes a clean draft with no violations', () => {
    const violations = findOutreachViolations(CLEAN_CONNECTION_NOTE, [
      'Different opening entirely.\nSomething else in the middle.\nFree for a call?\nJan',
    ]);

    expect(violations).toEqual([]);
  });
});

describe('assertValidOutreach', () => {
  it('throws OutreachValidationError for a violating draft', () => {
    expect(() =>
      assertValidOutreach(
        { ...CLEAN_CONNECTION_NOTE, body: 'x'.repeat(301) },
        [],
      ),
    ).toThrow(OutreachValidationError);
  });

  it('does not throw for a clean draft', () => {
    expect(() => assertValidOutreach(CLEAN_CONNECTION_NOTE, [])).not.toThrow();
  });
});
