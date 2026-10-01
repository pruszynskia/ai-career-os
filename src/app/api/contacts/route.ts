import { NextResponse } from 'next/server';
import { z } from 'zod';

import { ContactExistsError, contactService } from '@/entities/contact/service';
import { classifyTitle } from '@/features/contact/services/classify-title';
import { getOwnerId } from '@/shared/auth/session';
import { httpUrlSchema } from '@/shared/utils/http-url';

// The manual add path (TASK-084 deliverable: the feature works without an
// import). Classification runs the same deterministic matcher as the CSV
// import - one code path regardless of how the contact was added.
const addContactSchema = z.object({
  name: z.string().min(1).max(200),
  company: z.string().min(1).max(200),
  title: z.string().max(200).default(''),
  profileUrl: httpUrlSchema.optional(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsedInput = addContactSchema.safeParse(body);

  if (!parsedInput.success) {
    // MISC-1: a bad profileUrl (e.g. missing "https://") previously
    // reported the same generic message as a missing name/company.
    const fieldErrors = parsedInput.error.flatten().fieldErrors;
    const message = fieldErrors.profileUrl
      ? 'Enter a valid URL, including https:// (e.g. https://linkedin.com/in/...).'
      : 'name and company are required.';
    return NextResponse.json({ message }, { status: 400 });
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
    if (error instanceof ContactExistsError) {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }

    console.error('Failed to add the contact', error);
    return NextResponse.json(
      { message: 'Failed to add the contact.' },
      { status: 500 },
    );
  }
}
