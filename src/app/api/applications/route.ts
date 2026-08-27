import { NextResponse } from 'next/server';
import { z } from 'zod';

import { applicationSchema } from '@/entities/application/types';
import {
  CvNotFoundError,
  createApplication,
  OfferNotFoundError,
} from '@/features/application/services/create-application.service';
import { searchApplicationsAndOffers } from '@/features/application/services/search-applications.service';

const createApplicationSchema = applicationSchema
  .pick({ jobOfferId: true, sentCvId: true, recruiterMessage: true })
  // Empty is allowed: tracking may run before a recruiter message is
  // generated (TASK-044). The column stays NOT NULL.
  .extend({ recruiterMessage: z.string() });

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsedInput = createApplicationSchema.safeParse(body);

  if (!parsedInput.success) {
    return NextResponse.json(
      { message: 'jobOfferId and sentCvId are required.' },
      { status: 400 },
    );
  }

  try {
    const application = await createApplication(parsedInput.data);
    return NextResponse.json({ application });
  } catch (error) {
    if (
      error instanceof OfferNotFoundError ||
      error instanceof CvNotFoundError
    ) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }

    console.error('Failed to create the application', error);
    return NextResponse.json(
      { message: 'Failed to create the application.' },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get('q') ?? undefined;

  try {
    const result = await searchApplicationsAndOffers(query);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to search', error);
    return NextResponse.json({ message: 'Failed to search.' }, { status: 500 });
  }
}
