import { NextResponse } from 'next/server';

import { NoMasterCvError } from '@/entities/cv-document/service';
import { optimizeCoverLetter } from '@/features/cv/services/optimize-cover-letter.service';
import { toAiErrorResponse } from '@/shared/ai/errors';

// Longer than the 90s SDK timeout (AI-7) so a slow provider's own timeout
// error reaches the fallback logic instead of Vercel killing the function
// first and returning a non-JSON 504.
export const maxDuration = 120;

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
