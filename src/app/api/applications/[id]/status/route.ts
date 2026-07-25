import { NextResponse } from 'next/server';
import { z } from 'zod';

import { applicationStatusSchema } from '@/entities/application/types';
import {
  ApplicationNotFoundError,
  updateApplicationStatus,
} from '@/features/application/services/update-status.service';

const updateStatusSchema = z.object({
  status: applicationStatusSchema,
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const body = await request.json().catch(() => null);
  const parsedInput = updateStatusSchema.safeParse(body);

  if (!parsedInput.success) {
    return NextResponse.json(
      { message: 'A valid status is required.' },
      { status: 400 },
    );
  }

  const { id } = await params;

  try {
    const application = await updateApplicationStatus(
      id,
      parsedInput.data.status,
    );
    return NextResponse.json({ application });
  } catch (error) {
    if (error instanceof ApplicationNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }

    console.error('Failed to update the application status', error);
    return NextResponse.json(
      { message: 'Failed to update the application status.' },
      { status: 500 },
    );
  }
}
