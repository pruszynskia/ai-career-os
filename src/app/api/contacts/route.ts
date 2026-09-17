import { NextResponse } from 'next/server';
import { z } from 'zod';

import { contactService } from '@/entities/contact/service';
import { classifyTitle } from '@/features/contact/services/classify-title';
import { getOwnerId } from '@/shared/auth/session';

// The manual add path (TASK-084 deliverable: the feature works without an
// import). Classification runs the same deterministic matcher as the CSV
// import - one code path regardless of how the contact was added.
const addContactSchema = z.object({
  name: z.string().min(1),
  company: z.string().min(1),
  title: z.string().default(''),
  profileUrl: z.string().url().optional(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsedInput = addContactSchema.safeParse(body);

  if (!parsedInput.success) {
    return NextResponse.json(
      { message: 'name and company are required.' },
      { status: 400 },
    );
  }

  try {
    const ownerId = await getOwnerId();
    const { name, company, title, profileUrl } = parsedInput.data;
    const contact = await contactService.create(ownerId, {
      name,
      company,
      title,
      profileUrl: profileUrl ?? null,
      classification: classifyTitle(title),
      firstDegree: true,
    });
    return NextResponse.json(contact);
  } catch (error) {
    console.error('Failed to add the contact', error);
    return NextResponse.json(
      { message: 'Failed to add the contact.' },
      { status: 500 },
    );
  }
}
