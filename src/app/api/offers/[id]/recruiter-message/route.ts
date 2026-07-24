import { NextResponse } from 'next/server';

import { NoMasterCvError } from '@/features/job-offer/services/get-master-cv';
import { OfferNotFoundError } from '@/features/job-offer/services/get-offer';
import { generateRecruiterMessage } from '@/features/job-offer/services/recruiter-message.service';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const { message } = await generateRecruiterMessage(id);
    return NextResponse.json({ message });
  } catch (error) {
    if (error instanceof OfferNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }

    if (error instanceof NoMasterCvError) {
      return NextResponse.json({ message: error.message }, { status: 422 });
    }

    console.error('Failed to generate the recruiter message', error);
    return NextResponse.json(
      { message: 'Failed to generate the recruiter message.' },
      { status: 500 },
    );
  }
}
