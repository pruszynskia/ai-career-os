import { NextResponse } from 'next/server';

import { generateCoverLetter } from '@/features/job-offer/services/cover-letter.service';
import { NoMasterCvError } from '@/features/job-offer/services/get-master-cv';
import { OfferNotFoundError } from '@/entities/job-offer/service';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const { content } = await generateCoverLetter(id);
    return NextResponse.json({ content });
  } catch (error) {
    if (error instanceof OfferNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }

    if (error instanceof NoMasterCvError) {
      return NextResponse.json({ message: error.message }, { status: 422 });
    }

    console.error('Failed to generate the cover letter', error);
    return NextResponse.json(
      { message: 'Failed to generate the cover letter.' },
      { status: 500 },
    );
  }
}
