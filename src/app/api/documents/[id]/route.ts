import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  CvDocumentNotFoundError,
  cvDocumentService,
} from '@/entities/cv-document/service';
import { getOwnerId } from '@/shared/auth/session';

const updateDocumentSchema = z.object({
  content: z.string(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const body = await request.json().catch(() => null);
  const parsedInput = updateDocumentSchema.safeParse(body);

  if (!parsedInput.success) {
    return NextResponse.json(
      { message: 'content must be a string.' },
      { status: 400 },
    );
  }

  const { id } = await params;

  try {
    const ownerId = await getOwnerId();
    const cvDocument = await cvDocumentService.update(
      id,
      ownerId,
      parsedInput.data.content,
    );
    return NextResponse.json({ cvDocument });
  } catch (error) {
    if (error instanceof CvDocumentNotFoundError) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }

    console.error('Failed to save the document', error);
    return NextResponse.json(
      { message: 'Failed to save the document.' },
      { status: 500 },
    );
  }
}
