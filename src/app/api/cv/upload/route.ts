import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  extractCvText,
  isSupportedCvFile,
  UnsupportedFileTypeError,
} from '@/features/cv/services/extract-cv-text';
import { uploadCv } from '@/features/cv/services/upload-cv.service';
import { isRateLimitError } from '@/shared/ai/service';

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
    const { profile, cvDocument } = await uploadCv(text);

    return NextResponse.json({ profile, cvDocument });
  } catch (error) {
    if (error instanceof UnsupportedFileTypeError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    if (isRateLimitError(error)) {
      return NextResponse.json(
        {
          message:
            'The AI provider rate limit or quota was exceeded. Try again later.',
        },
        { status: 429 },
      );
    }

    console.error('Failed to process the CV', error);
    return NextResponse.json(
      { message: 'Failed to process the CV.' },
      { status: 500 },
    );
  }
}
