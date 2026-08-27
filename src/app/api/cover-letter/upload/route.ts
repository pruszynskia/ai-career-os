import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  extractCvText,
  isSupportedCvFile,
  UnsupportedFileTypeError,
} from '@/features/cv/services/extract-cv-text';
import { uploadCoverLetter } from '@/features/cv/services/upload-cover-letter.service';
import { toAiErrorResponse } from '@/shared/ai/errors';

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

    return toAiErrorResponse(error, 'Failed to process the cover letter.');
  }
}
