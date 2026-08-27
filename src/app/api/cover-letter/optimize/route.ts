import { NextResponse } from 'next/server';

import { NoMasterCvError } from '@/entities/cv-document/service';
import { optimizeCoverLetter } from '@/features/cv/services/optimize-cover-letter.service';
import { toAiErrorResponse } from '@/shared/ai/errors';

export async function POST() {
  try {
    const { cvDocument, improvements } = await optimizeCoverLetter();

    return NextResponse.json({ cvDocument, improvements });
  } catch (error) {
    if (error instanceof NoMasterCvError) {
      return NextResponse.json({ message: error.message }, { status: 422 });
    }

    return toAiErrorResponse(error, 'Failed to optimize the cover letter.');
  }
}
