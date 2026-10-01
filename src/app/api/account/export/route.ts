import { NextResponse } from 'next/server';

import { aiUsageService } from '@/entities/ai-usage/service';
import { applicationService } from '@/entities/application/service';
import { applicationStatusEventService } from '@/entities/application-status-event/service';
import { contactService } from '@/entities/contact/service';
import { cvDocumentService } from '@/entities/cv-document/service';
import { jobOfferService } from '@/entities/job-offer/service';
import { outreachMessageService } from '@/entities/outreach-message/service';
import { postCampaignService } from '@/entities/post-campaign/service';
import { postService } from '@/entities/post/service';
import { profileService } from '@/entities/profile/service';
import { subscriptionService } from '@/entities/subscription/service';
import { getOwnerId } from '@/shared/auth/session';
import { getPlanForOwner, meetsPlan } from '@/shared/billing/entitlements';

// Everything the signed-in owner owns, as one JSON download. Every read goes
// through the request client and RLS (owner_id = auth.uid()) — same as any
// other page — so this can never return another owner's data. Pro-only
// payloads (fit report, tailoring report) are generated for every plan
// (ADR-024) and stripped here for Free, same as the offer page does.
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
    plan,
    outreachMessages,
    postCampaigns,
    aiUsage,
  ] = await Promise.all([
    profileService.findUnique(ownerId),
    jobOfferService.findMany({ ownerId }),
    cvDocumentService.findMany(ownerId),
    applicationService.findMany({ ownerId }),
    postService.findMany({ ownerId }),
    applicationStatusEventService.findAllByOwnerId(ownerId),
    subscriptionService.findByOwnerId(ownerId),
    contactService.findAllByOwnerId(ownerId),
    getPlanForOwner(ownerId),
    outreachMessageService.findAllByOwnerId(ownerId),
    postCampaignService.findMany({ ownerId }),
    aiUsageService.findAllByOwnerId(ownerId),
  ]);
  const isPro = meetsPlan(plan, 'pro');

  return NextResponse.json(
    {
      exportedAt: new Date().toISOString(),
      profile,
      jobOffers: isPro
        ? jobOffers
        : jobOffers.map((offer) => ({ ...offer, fit: null })),
      cvDocuments: isPro
        ? cvDocuments
        : cvDocuments.map((doc) => ({ ...doc, tailoringReport: null })),
      applications,
      posts,
      statusEvents,
      subscription,
      contacts,
      outreachMessages,
      postCampaigns,
      aiUsage,
    },
    {
      headers: {
        'Content-Disposition': 'attachment; filename="account-export.json"',
      },
    },
  );
}
