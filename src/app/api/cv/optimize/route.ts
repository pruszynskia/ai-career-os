import { NextResponse } from 'next/server';

import {
  NoMasterCvError,
  optimizeCv,
} from '@/features/cv/services/optimize-cv.service';

export async function POST() {
  try {
    const { cvDocument, improvements } = await optimizeCv();

    return NextResponse.json({ cvDocument, improvements });
  } catch (error) {
    if (error instanceof NoMasterCvError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { message: 'Failed to optimize the CV.' },
      { status: 500 },
    );
  }
}
