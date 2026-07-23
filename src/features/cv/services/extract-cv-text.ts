import 'server-only';

import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';

export class UnsupportedFileTypeError extends Error {
  constructor() {
    super('Unsupported file type. Upload a PDF or DOCX file.');
    this.name = 'UnsupportedFileTypeError';
  }
}

export function isSupportedCvFile(filename: string): boolean {
  const extension = filename.toLowerCase().split('.').pop();
  return extension === 'pdf' || extension === 'docx';
}

export async function extractCvText(
  buffer: Buffer,
  filename: string,
): Promise<string> {
  const extension = filename.toLowerCase().split('.').pop();

  if (extension === 'pdf') {
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      return result.text;
    } finally {
      await parser.destroy();
    }
  }

  if (extension === 'docx') {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  throw new UnsupportedFileTypeError();
}
