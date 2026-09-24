import Link from 'next/link';

import { applicationService } from '@/entities/application/service';
import { applicationStatusEventService } from '@/entities/application-status-event/service';
import { isTerminalApplicationStatus } from '@/entities/application/types';
import { jobOfferService } from '@/entities/job-offer/service';
import { outreachMessageService } from '@/entities/outreach-message/service';
import { postService } from '@/entities/post/service';
import { deriveNudges } from '@/features/notification/services/derive-nudges';
import { FavoriteOffersCard } from '@/features/dashboard/components/favorite-offers-card';
import { NextPostCard } from '@/features/dashboard/components/next-post-card';
import { PipelineStrip } from '@/features/dashboard/components/pipeline-strip';
import { RecentActivityCard } from '@/features/dashboard/components/recent-activity-card';
import { RecentOffersCard } from '@/features/dashboard/components/recent-offers-card';
import { ResponseRateCard } from '@/features/dashboard/components/response-rate-card';
import { UpcomingInterviewsCard } from '@/features/dashboard/components/upcoming-interviews-card';
import { getResponseRateReadout } from '@/features/dashboard/services/response-rate-readout.service';
import { getOwnerId } from '@/shared/auth/session';
import { EntitlementError } from '@/shared/billing/errors';
import { AppPageLayout } from '@/shared/layouts';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardTitle } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { Grid, VStack } from '@/shared/ui/primitives';
import { NeedsAttentionCard } from '@/widgets/needs-attention-card/needs-attention-card';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const ownerId = await getOwnerId();
  const [
    posts,
    applications,
    favoriteOffers,
    offers,
    recentActivity,
    statusEvents,
    outreachSends,
    responseRateReadout,
  ] = await Promise.all([
    postService.findMany(
      { ownerId, status: 'SCHEDULED' },
      { orderBy: 'scheduledAt', take: 1 },
    ),
    applicationService.findMany({ ownerId }),
    jobOfferService.findMany({ ownerId, isFavorite: true }),
    // Needs attention (below) needs every offer, not just the most recent
    // five - the same `offers` fetch get-notifications.service.ts uses for
    // its own nudge derivation. recentOffers (below) slices this instead of
    // a second, redundant query.
    jobOfferService.findMany({ ownerId }),
    applicationStatusEventService.findRecent({ ownerId }, { take: 5 }),
    applicationStatusEventService.findAllByOwnerId(ownerId),
    outreachMessageService.findSendsByOwnerId(ownerId),
    // Free plan: null, not a thrown error, so the card below renders its
    // own inline upgrade prompt instead of taking down the whole page.
    getResponseRateReadout(ownerId).catch((error) => {
      if (error instanceof EntitlementError) return null;
      throw error;
    }),
  ]);
  // Active pipeline: still-open work, not the terminal outcomes (TASK-085) -
  // an OFFER/REJECTED/NO_RESPONSE/EXPIRED application is done, not upcoming.
  const upcoming = applications.filter(
    (a) => a.status !== 'APPLIED' && !isTerminalApplicationStatus(a.status),
  );
  const recentOffers = offers.slice(0, 5);
  // empty here means the account genuinely has zero offers, which is also
  // the only way applications/interviews/activity can be empty (both FK to
  // a job offer). One first-run panel replaces all four list sections
  // rather than each showing its own empty box.
  const hasOffers = offers.length > 0;

  // Needs attention - the same two nudges the notification popover derives
  // (TASK-086's derive-nudges.ts deriveNudges), from the same inputs
  // get-notifications.service.ts assembles, so both agree on the same
  // nudge for the same fixture.
  const needsAttention = deriveNudges(
    { applications, offers, statusEvents, outreachSends },
    new Date(),
  ).sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());

  return (
    <AppPageLayout
      title="Dashboard"
      subtitle={
        hasOffers
          ? `${upcoming.length} application${upcoming.length === 1 ? '' : 's'} in progress`
          : undefined
      }
      action={
        hasOffers && (
          <Button asChild variant="secondary">
            <Link href="/offers?view=board">Open board</Link>
          </Button>
        )
      }
    >
      <PipelineStrip applications={applications} />
      <Grid cols={1} colsMd={12} gap={6}>
        <VStack gap={6} className="md:col-span-8">
          {hasOffers ? (
            <>
              <NeedsAttentionCard notifications={needsAttention} />
              <UpcomingInterviewsCard applications={upcoming} />
              <RecentActivityCard events={recentActivity} />
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center gap-3.5 px-8 py-16 text-center">
                <CardTitle>Start with one offer</CardTitle>
                <EmptyState
                  message="Add your first job offer to start tracking applications, interviews and activity here."
                  className="items-center"
                  action={
                    <Button asChild size="sm">
                      <Link href="/offers">Add your first offer</Link>
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          )}
        </VStack>
        <VStack gap={6} className="md:col-span-4">
          <ResponseRateCard readout={responseRateReadout} />
          <NextPostCard post={posts[0] ?? null} />
          {hasOffers && (
            <>
              <FavoriteOffersCard offers={favoriteOffers} />
              <RecentOffersCard offers={recentOffers} />
            </>
          )}
        </VStack>
      </Grid>
    </AppPageLayout>
  );
}
