import type { NewContact } from '@/entities/contact/service';
import { classifyTitle } from '@/features/contact/services/classify-title';

export interface ParsedConnections {
  contacts: NewContact[];
  skipped: number;
}

export class InvalidConnectionsFileError extends Error {
  constructor(
    message = 'This does not look like a LinkedIn Connections export.',
  ) {
    super(message);
    this.name = 'InvalidConnectionsFileError';
  }
}

// Minimal RFC4180-ish CSV parser (quoted fields, embedded commas/newlines,
// "" as an escaped quote) - LinkedIn's export quotes any field that can
// contain a comma (company, position), so a naive split(',') mis-parses
// those rows. No dependency added for this; the format is small and fixed.
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

const HEADER_COLUMN = 'first name';

// LinkedIn's "Connections.csv" export puts a few "Notes:" lines and a
// blank line above the real header - find the header by its first column
// name rather than assuming a fixed line number.
function findHeaderIndex(rows: string[][]): number {
  return rows.findIndex(
    (row) => row[0]?.trim().toLowerCase() === HEADER_COLUMN,
  );
}

// Pure parsing step, kept free of 'server-only'/DB imports so the risky
// part (quoted fields, the notes rows LinkedIn's export puts above the
// header, header discovery) is unit-testable directly.
export function parseConnectionsCsv(csvText: string): ParsedConnections {
  const rows = parseCsv(csvText);
  const headerIndex = findHeaderIndex(rows);

  if (headerIndex === -1) {
    throw new InvalidConnectionsFileError();
  }

  const header = rows[headerIndex].map((cell) => cell.trim().toLowerCase());
  const columnIndex = (name: string) => header.indexOf(name);
  const firstNameIdx = columnIndex('first name');
  const lastNameIdx = columnIndex('last name');
  const urlIdx = columnIndex('url');
  const companyIdx = columnIndex('company');
  const positionIdx = columnIndex('position');

  const contacts: NewContact[] = [];
  let skipped = 0;

  for (const row of rows.slice(headerIndex + 1)) {
    // A trailing blank line at end of file, not a data row.
    if (row.every((cell) => cell.trim() === '')) continue;

    const firstName = firstNameIdx >= 0 ? (row[firstNameIdx] ?? '').trim() : '';
    const lastName = lastNameIdx >= 0 ? (row[lastNameIdx] ?? '').trim() : '';
    const name = `${firstName} ${lastName}`.trim();
    const company = companyIdx >= 0 ? (row[companyIdx] ?? '').trim() : '';
    const title = positionIdx >= 0 ? (row[positionIdx] ?? '').trim() : '';
    const profileUrl = urlIdx >= 0 ? (row[urlIdx] ?? '').trim() || null : null;

    if (!company || !name) {
      skipped++;
      continue;
    }

    contacts.push({
      name,
      company,
      title,
      profileUrl,
      classification: classifyTitle(title),
      // LinkedIn's own Connections export only ever lists first-degree
      // connections - there is no signal in the file for anything else.
      firstDegree: true,
    });
  }

  return { contacts, skipped };
}
