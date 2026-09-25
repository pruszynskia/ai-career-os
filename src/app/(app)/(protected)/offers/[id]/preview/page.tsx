import { notFound } from 'next/navigation';

import { applicationService } from '@/entities/application/service';
import {
  getOfferOrThrow,
  OfferNotFoundError,
} from '@/entities/job-offer/service';
import { getOwnerId } from '@/shared/auth/session';
import { getPlanForOwner, meetsPlan } from '@/shared/billing/entitlements';
import { OfferPreviewPane } from '@/widgets/unified-offer-list/unified-offer-list';

export const dynamic = 'force-dynamic';

// Full-page preview for the mobile offers list (TASK-127) - below 768,
// selecting a row navigates here instead of opening TASK-106's 344px pane
// or 768-1279 drawer. Reuses the pane's own content and the same
// offer/application reads the offer detail page already does
// (getOfferOrThrow + applicationService.findByOffer) rather than a second
// listOffersWithApplication-style query built for a whole list.
export default async function OfferPreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    q?: string;
    sort?: string;
    favorite?: string;
  }>;
}) {
  const { id } = await params;
  // Forwarded from the list's row link (unified-offer-list.tsx) so "back"
  // returns to the same search/sort/favorites filter instead of resetting it.
  const { q, sort, favorite } = await searchParams;
  const listParams = new URLSearchParams();
  if (q) listParams.set('q', q);
  if (sort) listParams.set('sort', sort);
  if (favorite) listParams.set('favorite', favorite);
  const closeHref = listParams.toString()
    ? `/offers?${listParams.toString()}`
    : '/offers';
  const ownerId = await getOwnerId();

  let offer;
  try {
    offer = await getOfferOrThrow(id);
  } catch (error) {
    if (error instanceof OfferNotFoundError) notFound();
    throw error;
  }

  const [application, plan] = await Promise.all([
    applicationService.findByOffer(ownerId, id),
    getPlanForOwner(ownerId),
  ]);
  // Fit detail (recommended action, callback probability) is Pro-only
  // (TASK-088) - same strip the list page applies before this offer ever
  // reaches a client component.
  const canViewFitDetail = meetsPlan(plan, 'pro');

  return (
    // `fixed inset-x-0` (rather than `-m-6` clawing back Screen's own p-6) so
    // this doesn't silently break if that padding value ever changes, and so
    // a phone in landscape or a direct/bookmarked link at md+ still gets a
    // real page instead of nothing: full-bleed below 768, a plain card in
    // the normal page flow at 768+ (that width already has TASK-106's
    // pane/drawer for the in-list case; this only covers reaching the URL
    // directly). Bounded by top-14/bottom-[76px] (not `inset-0`) so the
    // mobile shell's MobileHeader and MobileTabBar (mobile-tab-bar.tsx)
    // stay visible instead of being covered by this page.
    <div className="fixed inset-x-0 top-14 bottom-[76px] z-30 overflow-hidden bg-popover md:static md:inset-auto md:z-auto md:h-[calc(100vh-3rem)] md:rounded-lg md:border md:border-border">
      <OfferPreviewPane
        offer={{
          ...offer,
          fit: canViewFitDetail ? offer.fit : null,
          application,
        }}
        canViewFitDetail={canViewFitDetail}
        closeHref={closeHref}
      />
    </div>
  );
}
