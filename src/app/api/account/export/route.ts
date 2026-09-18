import { NextResponse } from 'next/server';

import { applicationService } from '@/entities/application/service';
import { applicationStatusEventService } from '@/entities/application-status-event/service';
import { contactService } from '@/entities/contact/service';
import { cvDocumentService } from '@/entities/cv-document/service';
import { jobOfferService } from '@/entities/job-offer/service';
import { postService } from '@/entities/post/service';
import { profileService } from '@/entities/profile/service';
import { subscriptionService } from '@/entities/subscription/service';
import { getOwnerId } from '@/shared/auth/session';

// Everything the signed-in owner owns, as one JSON download. Every read goes
// through the request client and RLS (owner_id = auth.uid()) — same as any
// other page — so this can never return another owner's data.
export async function GET() {
  const ownerId = await getOwnerId();

  const [
    profile,
    jobOffers,
    cvDocuments,
    applications,
    posts,
    statusEvents,
    subscription,
    contacts,
  ] = await Promise.all([
    profileService.findUnique(ownerId),
    jobOfferService.findMany({ ownerId }),
    cvDocumentService.findMany(ownerId),
    applicationService.findMany({ ownerId }),
    postService.findMany({ ownerId }),
    applicationStatusEventService.findAllByOwnerId(ownerId),
    subscriptionService.findByOwnerId(ownerId),
    contactService.findAllByOwnerId(ownerId),
  ]);

  return NextResponse.json(
    {
      exportedAt: new Date().toISOString(),
      profile,
      jobOffers,
      cvDocuments,
      applications,
      posts,
      statusEvents,
      subscription,
      contacts,
    },
    {
      headers: {
        'Content-Disposition': 'attachment; filename="account-export.json"',
      },
    },
  );
}
