import 'server-only';

import JSZip from 'jszip';
import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';
import { CanvasFactory } from 'pdf-parse/worker';

export class UnsupportedFileTypeError extends Error {
  constructor(message = 'Unsupported file type. Upload a PDF or DOCX file.') {
    super(message);
    this.name = 'UnsupportedFileTypeError';
  }
}

// Thrown by extractCvText for a scanned/image-only PDF or an empty document
// (AI-3): without this, callers would send near-empty text to the AI
// (charging a metered action for nothing usable) or overwrite the stored
// profile/CV with content extracted from it.
export class EmptyDocumentError extends Error {
  constructor() {
    super(
      'This file has no extractable text - it may be a scanned image. Upload a text-based PDF or DOCX.',
    );
    this.name = 'EmptyDocumentError';
  }
}

// Below this, a PDF is almost certainly a scanned image (pdf-parse returns a
// handful of stray characters, not prose) rather than a short real CV.
const MIN_READABLE_CHARS = 200;

// Same cap as the contacts import, and the same text cap as the pasted-offer
// path - the extracted text goes straight into an AI prompt.
const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024;
const MAX_TEXT_CHARS = 50_000;
// A real CV DOCX inflates to well under this; the 4 MB cap above bounds only
// the compressed size, so a zip bomb (5 MB -> GBs) is caught here instead.
const MAX_DOCX_UNCOMPRESSED_BYTES = 50 * 1024 * 1024;

// Extension alone is user-controlled; a DOCX is a zip ("PK\x03\x04").
const MAGIC_BYTES = { pdf: '%PDF-', docx: 'PK\x03\x04' } as const;

export function isSupportedCvFile(filename: string): boolean {
  const extension = filename.toLowerCase().split('.').pop();
  return extension === 'pdf' || extension === 'docx';
}

// loadAsync reads only the central directory (no inflation), so this is cheap.
// ponytail: relies on JSZip's internal _data.uncompressedSize (no public
// getter in 3.x); JSZip itself errors if the real size contradicts the header.
async function assertDocxNotZipBomb(buffer: Buffer): Promise<void> {
  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(buffer);
  } catch {
    throw new UnsupportedFileTypeError(
      'The file content does not match its type. Upload a real PDF or DOCX file.',
    );
  }
  let total = 0;
  for (const entry of Object.values(zip.files)) {
    total +=
      (entry as unknown as { _data?: { uncompressedSize?: number } })._data
        ?.uncompressedSize ?? 0;
  }
  if (total > MAX_DOCX_UNCOMPRESSED_BYTES) {
    throw new UnsupportedFileTypeError(
      'This DOCX expands to an unreasonable size. Upload a normal CV file.',
    );
  }
}

export async function extractCvText(
  buffer: Buffer,
  filename: string,
): Promise<string> {
  const extension = filename.toLowerCase().split('.').pop();

  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    throw new UnsupportedFileTypeError('File is too large. The limit is 4 MB.');
  }
  if (
    (extension === 'pdf' || extension === 'docx') &&
    !buffer.toString('latin1', 0, 5).startsWith(MAGIC_BYTES[extension])
  ) {
    throw new UnsupportedFileTypeError(
      'The file content does not match its type. Upload a real PDF or DOCX file.',
    );
  }

  let text: string;
  if (extension === 'pdf') {
    const parser = new PDFParse({ data: buffer, CanvasFactory });
    try {
      const result = await parser.getText();
      text = result.text;
    } finally {
      await parser.destroy();
    }
  } else if (extension === 'docx') {
    await assertDocxNotZipBomb(buffer);
    const result = await mammoth.extractRawText({ buffer });
    text = result.value;
  } else {
    throw new UnsupportedFileTypeError();
  }

  if (text.trim().length < MIN_READABLE_CHARS) {
    throw new EmptyDocumentError();
  }
  return text.slice(0, MAX_TEXT_CHARS);
}
