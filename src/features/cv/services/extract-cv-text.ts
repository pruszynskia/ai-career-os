import 'server-only';

import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';
import { CanvasFactory } from 'pdf-parse/worker';

export class UnsupportedFileTypeError extends Error {
  constructor() {
    super('Unsupported file type. Upload a PDF or DOCX file.');
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

export function isSupportedCvFile(filename: string): boolean {
  const extension = filename.toLowerCase().split('.').pop();
  return extension === 'pdf' || extension === 'docx';
}

export async function extractCvText(
  buffer: Buffer,
  filename: string,
): Promise<string> {
  const extension = filename.toLowerCase().split('.').pop();

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
    const result = await mammoth.extractRawText({ buffer });
    text = result.value;
  } else {
    throw new UnsupportedFileTypeError();
  }

  if (text.trim().length < MIN_READABLE_CHARS) {
    throw new EmptyDocumentError();
  }
  return text;
}
