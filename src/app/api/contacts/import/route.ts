import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  InvalidConnectionsFileError,
  importConnections,
} from '@/features/contact/services/import-connections.service';

const uploadSchema = z.object({
  file: z.instanceof(File),
});

// LinkedIn's own export is a few hundred KB even for a few thousand
// connections; this is generous headroom, not a tuned limit.
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

export async function POST(request: Request) {
  const formData = await request.formData();
  const parsedInput = uploadSchema.safeParse({ file: formData.get('file') });

  if (!parsedInput.success) {
    return NextResponse.json(
      { message: 'A CSV file is required.' },
      { status: 400 },
    );
  }

  const { file } = parsedInput.data;

  if (!file.name.toLowerCase().endsWith('.csv')) {
    return NextResponse.json(
      { message: 'Unsupported file type. Upload a CSV file.' },
      { status: 400 },
    );
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      { message: 'That file is too large.' },
      { status: 400 },
    );
  }

  try {
    const text = await file.text();
    const result = await importConnections(text);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof InvalidConnectionsFileError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    console.error('Failed to import connections', error);
    return NextResponse.json(
      { message: 'Failed to import connections.' },
      { status: 500 },
    );
  }
}
