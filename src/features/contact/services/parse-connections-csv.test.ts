import { describe, expect, it } from 'vitest';

import {
  InvalidConnectionsFileError,
  parseConnectionsCsv,
} from './parse-connections-csv';

const NOTES_PREFIX =
  'Notes:\n"When exporting your connection data, you may notice..."\n\n';

const HEADER =
  'First Name,Last Name,URL,Email Address,Company,Position,Connected On';

describe('parseConnectionsCsv', () => {
  it('skips the notes rows LinkedIn puts above the header and finds it by column name', () => {
    const csv = `${NOTES_PREFIX}${HEADER}\nJane,Doe,https://linkedin.com/in/jane,,Acme,Engineering Manager,1 Jan 2024\n`;

    const { contacts, skipped } = parseConnectionsCsv(csv);

    expect(skipped).toBe(0);
    expect(contacts).toEqual([
      {
        name: 'Jane Doe',
        company: 'Acme',
        title: 'Engineering Manager',
        profileUrl: 'https://linkedin.com/in/jane',
        classification: 'decision-maker',
        firstDegree: true,
      },
    ]);
  });

  it('parses a quoted field containing a comma without mis-splitting the row', () => {
    const csv = `${HEADER}\nJane,Doe,https://linkedin.com/in/jane,,"Acme, Inc.",Founder,1 Jan 2024\n`;

    const { contacts } = parseConnectionsCsv(csv);

    expect(contacts[0]?.company).toBe('Acme, Inc.');
  });

  it('skips rows with no company and counts them', () => {
    const csv = `${HEADER}\nJane,Doe,https://linkedin.com/in/jane,,,Founder,1 Jan 2024\n`;

    const { contacts, skipped } = parseConnectionsCsv(csv);

    expect(contacts).toHaveLength(0);
    expect(skipped).toBe(1);
  });

  it('ignores a trailing blank line', () => {
    const csv = `${HEADER}\nJane,Doe,https://linkedin.com/in/jane,,Acme,Founder,1 Jan 2024\n\n`;

    const { contacts, skipped } = parseConnectionsCsv(csv);

    expect(contacts).toHaveLength(1);
    expect(skipped).toBe(0);
  });

  it('throws InvalidConnectionsFileError when no header row is found', () => {
    expect(() =>
      parseConnectionsCsv('not,a,connections,export\n1,2,3,4\n'),
    ).toThrow(InvalidConnectionsFileError);
  });
});
