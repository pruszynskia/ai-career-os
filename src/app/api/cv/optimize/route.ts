import { NextResponse } from 'next/server';

import {
  NoMasterCvError,
  optimizeCv,
} from '@/features/cv/services/optimize-cv.service';
import { isRateLimitError } from '@/shared/ai/service';

export async function POST() {
  try {
    const { cvDocument, improvements } = await optimizeCv();

    return NextResponse.json({ cvDocument, improvements });
  } catch (error) {
    if (error instanceof NoMasterCvError) {
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

    console.error('Failed to optimize the CV', error);
    return NextResponse.json(
      { message: 'Failed to optimize the CV.' },
      { status: 500 },
    );
  }
}
