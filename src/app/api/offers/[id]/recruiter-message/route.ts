import { NextResponse } from 'next/server';

import { NoMasterCvError } from '@/features/job-offer/services/get-master-cv';
import { OfferNotFoundError } from '@/entities/job-offer/service';
import { generateRecruiterMessage } from '@/features/job-offer/services/recruiter-message.service';
import { isRateLimitError } from '@/shared/ai/service';

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

    if (isRateLimitError(error)) {
      return NextResponse.json(
        {
          message:
            'The AI provider rate limit or quota was exceeded. Try again later.',
        },
        { status: 429 },
      );
    }

    console.error('Failed to generate the recruiter message', error);
    return NextResponse.json(
      { message: 'Failed to generate the recruiter message.' },
      { status: 500 },
    );
  }
}
