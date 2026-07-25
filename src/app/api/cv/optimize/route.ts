import { NextResponse } from 'next/server';

import {
  NoMasterCvError,
  optimizeCv,
} from '@/features/cv/services/optimize-cv.service';
import { toAiErrorResponse } from '@/shared/ai/errors';

export async function POST() {
  try {
    const { cvDocument, improvements } = await optimizeCv();

    return NextResponse.json({ cvDocument, improvements });
  } catch (error) {
    if (error instanceof NoMasterCvError) {
      return NextResponse.json({ message: error.message }, { status: 422 });
    }

    return toAiErrorResponse(error, 'Failed to optimize the CV.');
  }
}
