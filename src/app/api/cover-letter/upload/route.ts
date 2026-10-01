import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  EmptyDocumentError,
  extractCvText,
  isSupportedCvFile,
  UnsupportedFileTypeError,
} from '@/features/cv/services/extract-cv-text';
import { uploadCoverLetter } from '@/features/cv/services/upload-cover-letter.service';
import { toAiErrorResponse } from '@/shared/ai/errors';

// Longer than the 90s SDK timeout (AI-7) so a slow provider's own timeout
// error reaches the fallback logic instead of Vercel killing the function
// first and returning a non-JSON 504.
export const maxDuration = 120;

const uploadSchema = z.object({
  file: z.instanceof(File),
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const parsedInput = uploadSchema.safeParse({ file: formData.get('file') });

    if (!parsedInput.success) {
      return NextResponse.json(
        { message: 'A PDF or DOCX file is required.' },
        { status: 400 },
      );
    }

    const { file } = parsedInput.data;

    if (!isSupportedCvFile(file.name)) {
      return NextResponse.json(
        { message: 'Unsupported file type. Upload a PDF or DOCX file.' },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await extractCvText(buffer, file.name);
    const { cvDocument } = await uploadCoverLetter(text);

    return NextResponse.json({ cvDocument });
  } catch (error) {
    if (error instanceof UnsupportedFileTypeError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    if (error instanceof EmptyDocumentError) {
      return NextResponse.json({ message: error.message }, { status: 422 });
    }

    return toAiErrorResponse(error, 'Failed to process the cover letter.');
  }
}
