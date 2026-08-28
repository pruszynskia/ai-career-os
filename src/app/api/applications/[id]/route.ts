import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  ApplicationNotFoundError,
  updateApplicationNotes,
} from '@/features/application/services/update-notes.service';

const updateNotesSchema = z.object({
  notes: z.string().max(10_000),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const body = await request.json().catch(() => null);
  const parsedInput = updateNotesSchema.safeParse(body);

  if (!parsedInput.success) {
    return NextResponse.json(
      { message: 'Valid notes are required.' },
      { status: 400 },
    );
  }

  const { id } = await params;

  try {
    const application = await updateApplicationNotes(id, parsedInput.data.notes);
    return NextResponse.json({ application });
  } catch (error) {
    if (error instanceof ApplicationNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }

    console.error('Failed to update the application notes', error);
    return NextResponse.json(
      { message: 'Failed to update the application notes.' },
      { status: 500 },
    );
  }
}
