'use client';

import type { ApplicationBundle } from '@/entities/application/types';
import type { CvDocument } from '@/entities/cv-document/types';
import type { JobOffer } from '@/entities/job-offer/types';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useRef, useState, type ReactNode } from 'react';
import { Star } from 'lucide-react';

import { APPLICATION_STATUS_LABELS } from '@/entities/application/types';
import { StageRing } from '@/entities/application/ui/stage-ring';
import { DeleteOfferButton } from '@/features/job-offer/components/delete-offer-button';
import { FitReport } from '@/features/job-offer/components/fit-report';
import { OutreachPanel } from '@/features/job-offer/components/outreach-panel';
import { useCoverLetter } from '@/features/job-offer/hooks/use-cover-letter';
import { useMatchOffer } from '@/features/job-offer/hooks/use-match-offer';
import { useTailorCv } from '@/features/job-offer/hooks/use-tailor-cv';
import { useToggleFavorite } from '@/features/job-offer/hooks/use-toggle-favorite';
import { useUpdateOffer } from '@/features/job-offer/hooks/use-update-offer';
import { downloadTextFile } from '@/shared/utils/download-text-file';
import { Badge } from '@/shared/ui/primitives/feedback/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import { DocumentEditor } from '@/shared/ui/document-editor';
import { Input } from '@/shared/ui/input';
import { LockedPanel } from '@/shared/ui/locked-panel';
import { StatCard } from '@/shared/ui/stat-card';
import { Textarea } from '@/shared/ui/textarea';
import {
  Grid,
  Heading,
  IconButton,
  Label,
  Spinner,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
} from '@/shared/ui/primitives';

export interface CreateApplicationInput {
  jobOfferId: string;
  sentCvId: string;
  recruiterMessage: string;
}

// The five offer-* mockups (fit/cv/outreach/letter/app) all share this tab
// strip - order and values are fixed by that shared chrome, not derived
// from anything dynamic.
const TAB_VALUES = ['fit', 'cv', 'outreach', 'letter', 'application'] as const;
type TabValue = (typeof TAB_VALUES)[number];

function isTabValue(value: string | null): value is TabValue {
  return (TAB_VALUES as readonly string[]).includes(value ?? '');
}

export function OfferDetail({
  offer,
  latestTailoredCv,
  masterCv,
  onTrackApplication,
  isTrackingApplication,
  applicationTimeline,
  applicationNotes,
  applicationStatusEventCount,
  application,
  applicationStatus,
  alwaysIncludeWhenRelevant,
  onAddSkill,
  addingSkill,
  renderTailoringReport,
  renderWhoYouKnow,
  interlockWarning,
  canViewFitDetail,
}: {
  offer: JobOffer;
  latestTailoredCv?: CvDocument;
  masterCv?: CvDocument;
  onTrackApplication: (
    input: CreateApplicationInput,
    options: { onSuccess: () => void },
  ) => void;
  isTrackingApplication: boolean;
  // Composed in the widget layer — OfferDetail (job-offer feature) cannot
  // import the application feature directly (ADR-008).
  applicationTimeline?: ReactNode;
  applicationNotes?: ReactNode;
  // Count for the Application tab's badge (TASK-108) - a plain number
  // rather than reading `applicationTimeline`'s own length, since that prop
  // is already a rendered (or undefined) ReactNode by the time it reaches
  // here.
  applicationStatusEventCount: number;
  // The tracked application (if any). Only `sentCv` was read directly here
  // before TASK-108 - `status`/`createdAt` are read too now, for the rail's
  // read-only Application card (the header's own stage control stays the
  // render-prop `applicationStatus` below, same ADR-008 reason).
  application?: Pick<
    ApplicationBundle,
    'sentCv' | 'status' | 'createdAt'
  > | null;
  applicationStatus?: ReactNode;
  // Same reason: the "add this absent-but-true skill" action writes to the
  // profile's evidence base, owned by the profile feature.
  alwaysIncludeWhenRelevant: string[];
  onAddSkill: (skill: string) => void;
  addingSkill: string | null;
  // Same reason again: the tailoring report panel is owned by the document
  // feature. A render prop rather than a plain ReactNode because the report
  // only exists once tailorCvMutation succeeds, inside this component.
  // Always called once a tailored CV exists, report or not - it decides for
  // itself whether a null report means "upgrade to see this" (Free,
  // TASK-088) or "nothing to show" (Pro, fit was never scored), and this
  // component renders whatever ReactNode (or null) comes back.
  renderTailoringReport?: (report: CvDocument['tailoringReport']) => ReactNode;
  // Same reason again: the who-you-know panel is owned by the contact
  // feature. A render prop (not a plain ReactNode) because OfferDetail owns
  // the "which contact is selected" state that both this panel and
  // OutreachPanel need (TASK-084) - the widget can't own it since it
  // doesn't render the outreach panel itself.
  renderWhoYouKnow?: (params: {
    onSelect: (contact: { name: string; profileUrl: string | null }) => void;
    selectedContactName: string | null;
  }) => ReactNode;
  interlockWarning?: { contactName: string; messagedAt: Date } | null;
  // Fit report detail is Pro-only (TASK-088); matchScore above stays free
  // regardless.
  canViewFitDetail: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [matchScore, setMatchScore] = useState(offer.matchScore);
  const [fit, setFit] = useState(offer.fit);
  // Holds the last generated letter across a Regenerate click (review fix,
  // TASK-110) - useMutation.mutate() resets isSuccess/data to their initial
  // state before the new request resolves, so reading
  // coverLetterMutation.data directly would hide the existing letter (and
  // the header's "Regenerating…" label) for the duration of the request.
  const [coverLetterDoc, setCoverLetterDoc] = useState<CvDocument | null>(null);
  const [selectedContact, setSelectedContact] = useState<{
    name: string;
    profileUrl: string | null;
  } | null>(null);
  const matchMutation = useMatchOffer();
  const tailorCvMutation = useTailorCv();
  const coverLetterMutation = useCoverLetter();
  const toggleFavoriteMutation = useToggleFavorite();
  const updateOfferMutation = useUpdateOffer();
  // Focuses the cover letter's DocumentEditor textarea for the header's
  // "Edit" action - DocumentEditor has no separate view/edit mode to toggle
  // (it's always an editable Textarea), so "Edit" just moves focus into it
  // rather than duplicating a save/edit mechanism it already owns.
  const coverLetterEditorRef = useRef<HTMLDivElement>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editValues, setEditValues] = useState({
    company: offer.company,
    title: offer.title,
    description: offer.description,
  });

  const tailoredCv = tailorCvMutation.data?.cvDocument ?? latestTailoredCv;
  const tailoringReportNode = tailoredCv
    ? renderTailoringReport?.(tailoredCv.tailoringReport)
    : null;
  const sentCv = tailoredCv ?? masterCv;
  const canTrackApplication = Boolean(sentCv);
  const isUsingMasterCvFallback = Boolean(sentCv) && !tailoredCv;

  // Deep-linkable, URL-synced tab state (TASK-108) - same
  // useSearchParams/useRouter/usePathname trio outreach-panel.tsx already
  // uses for its own `followUp` param. A followUp=1 link (the follow-up
  // nudge, TASK-086) still has to land on the Outreach tab even without its
  // own `tab` param. Captured once via lazy useState (not read live on every
  // render) because OutreachPanel's own mount effect strips `followUp` from
  // the URL right after firing its mutation - reading the param live would
  // have the tab fall back to "fit" the instant that strip happens, before
  // the user ever saw the generated follow-up (review fix, TASK-108).
  const [followUpRequestedOutreach] = useState(
    () => searchParams.get('followUp') === '1',
  );
  const tabParam = searchParams.get('tab');
  const activeTab: TabValue = isTabValue(tabParam)
    ? tabParam
    : followUpRequestedOutreach
      ? 'outreach'
      : 'fit';

  function handleTabChange(value: string) {
    const params = new URLSearchParams(searchParams);
    params.set('tab', value);
    // followUp is a one-shot trigger for OutreachPanel's mount effect, not
    // a tab-state param - dropping it here (rather than carrying it along
    // on every tab click) avoids it lingering in the URL if a tab is
    // clicked before that effect strips it itself.
    params.delete('followUp');
    // window.history.replaceState instead of router.replace (review fix,
    // TASK-108): this page is force-dynamic, so router.replace re-runs every
    // server query in page.tsx (offer, CVs, application, profile, plan,
    // status events, contacts, interlock) on every tab click, lagging the
    // switch behind a round trip. Next.js's router intercepts direct
    // history.replaceState calls and updates useSearchParams without a
    // server fetch.
    window.history.replaceState(null, '', `${pathname}?${params.toString()}`);
  }

  function openEditDialog() {
    setEditValues({
      company: offer.company,
      title: offer.title,
      description: offer.description,
    });
    updateOfferMutation.reset();
    setIsEditOpen(true);
  }

  function handleEditSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!editValues.company.trim() || !editValues.title.trim()) return;

    updateOfferMutation.mutate(
      { id: offer.id, ...editValues },
      { onSuccess: () => setIsEditOpen(false) },
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <div className="sticky top-0 z-10 flex flex-col gap-4 bg-background pb-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <Text size="sm" color="muted">
              {offer.company}
            </Text>
            <Heading level={2} as="h1">
              {offer.title}
            </Heading>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {offer.isExpired && <Badge variant="destructive">Expired</Badge>}
              <span>
                {offer.expiresAt
                  ? `Expires on ${offer.expiresAt.toLocaleDateString()}`
                  : 'No expiration set'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <IconButton
              aria-label={
                offer.isFavorite ? 'Remove from favorites' : 'Add to favorites'
              }
              aria-pressed={offer.isFavorite}
              variant={offer.isFavorite ? 'primary' : 'secondary'}
              disabled={toggleFavoriteMutation.isPending}
              onClick={() =>
                toggleFavoriteMutation.mutate({
                  id: offer.id,
                  isFavorite: !offer.isFavorite,
                })
              }
            >
              <Star
                aria-hidden="true"
                className={offer.isFavorite ? 'fill-current' : undefined}
              />
            </IconButton>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" size="sm" onClick={openEditDialog}>
                  Edit details
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit offer details</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={handleEditSubmit}
                  className="flex flex-col gap-3"
                >
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="offer-company">Company</Label>
                    <Input
                      id="offer-company"
                      value={editValues.company}
                      onChange={(event) =>
                        setEditValues((values) => ({
                          ...values,
                          company: event.target.value,
                        }))
                      }
                      disabled={updateOfferMutation.isPending}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="offer-title">Title</Label>
                    <Input
                      id="offer-title"
                      value={editValues.title}
                      onChange={(event) =>
                        setEditValues((values) => ({
                          ...values,
                          title: event.target.value,
                        }))
                      }
                      disabled={updateOfferMutation.isPending}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="offer-description">Description</Label>
                    <Textarea
                      id="offer-description"
                      className="resize-none"
                      value={editValues.description}
                      onChange={(event) =>
                        setEditValues((values) => ({
                          ...values,
                          description: event.target.value,
                        }))
                      }
                      rows={6}
                      disabled={updateOfferMutation.isPending}
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      type="submit"
                      disabled={
                        updateOfferMutation.isPending ||
                        !editValues.company.trim() ||
                        !editValues.title.trim()
                      }
                    >
                      {updateOfferMutation.isPending && <Spinner size="sm" />}
                      {updateOfferMutation.isPending ? 'Saving…' : 'Save'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <div
              role="group"
              className="flex items-center gap-1.5 text-sm text-muted-foreground"
              aria-label="Application stage"
            >
              <StageRing status={application?.status ?? null} />
              {application ? applicationStatus : 'Not tracked'}
            </div>

            <DeleteOfferButton offerId={offer.id} redirectTo="/offers" />
          </div>
        </div>

        <TabsList aria-label="Offer sections">
          <TabsTrigger value="fit">Fit report</TabsTrigger>
          <TabsTrigger value="cv">Tailored CV</TabsTrigger>
          <TabsTrigger value="outreach">Outreach</TabsTrigger>
          <TabsTrigger value="letter">Cover letter</TabsTrigger>
          <TabsTrigger value="application">
            Application
            <span data-slot="tabs-count">{applicationStatusEventCount}</span>
          </TabsTrigger>
        </TabsList>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="min-w-0">
          <TabsContent
            value="fit"
            forceMount
            className="data-[state=inactive]:hidden"
          >
            {matchScore === null ? (
              <Text size="sm" color="muted">
                Calculate a match score (in the rail) to see the fit report.
              </Text>
            ) : !canViewFitDetail ? (
              // Free: always the upgrade prompt, regardless of whether fit
              // was ever computed for this offer.
              <LockedPanel
                message="See the full fit report - criteria breakdown, callback probability and missing skills - on Pro. Your match score stays free."
                action={
                  <Button asChild size="sm">
                    <Link href="/pricing">Upgrade to Pro</Link>
                  </Button>
                }
              />
            ) : (
              fit && (
                // Pro with no fit yet (legacy row, or a parse failure in
                // entities/job-offer/service.ts) - nothing to gate, so stay
                // silent instead of telling a paying user to upgrade.
                <FitReport
                  matchScore={matchScore}
                  fit={fit}
                  alwaysIncludeWhenRelevant={alwaysIncludeWhenRelevant}
                  onAddSkill={onAddSkill}
                  addingSkill={addingSkill}
                />
              )
            )}
          </TabsContent>

          <TabsContent
            value="cv"
            forceMount
            className="flex flex-col gap-3 data-[state=inactive]:hidden"
          >
            <Heading level={4} as="h2">
              Tailored CV
            </Heading>
            <Button
              variant="primary"
              className="self-start"
              disabled={tailorCvMutation.isPending}
              onClick={() => tailorCvMutation.mutate(offer.id)}
            >
              {tailorCvMutation.isPending && <Spinner size="sm" />}
              {tailorCvMutation.isPending
                ? 'Tailoring…'
                : 'Generate tailored CV'}
            </Button>
            {tailoredCv && (
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                <div className="min-w-0 flex-1">
                  <DocumentEditor
                    key={tailoredCv.id}
                    documentId={tailoredCv.id}
                    content={tailoredCv.content}
                    downloadFilename="tailored-cv.txt"
                  />
                </div>
                {tailoringReportNode && (
                  <div className="w-full lg:w-80 lg:shrink-0">
                    {tailoringReportNode}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent
            value="outreach"
            forceMount
            className="flex flex-col gap-6 data-[state=inactive]:hidden"
          >
            {renderWhoYouKnow?.({
              onSelect: setSelectedContact,
              selectedContactName: selectedContact?.name ?? null,
            })}
            <OutreachPanel
              offerId={offer.id}
              selectedContact={selectedContact}
              interlockWarning={interlockWarning}
            />
          </TabsContent>

          <TabsContent
            value="letter"
            forceMount
            className="flex flex-col gap-3 data-[state=inactive]:hidden"
          >
            {coverLetterDoc ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-col gap-0.5">
                    <Heading level={4} as="h2">
                      Cover letter
                    </Heading>
                    <Text size="xs" color="muted">
                      Generated{' '}
                      {new Date(coverLetterDoc.createdAt).toLocaleDateString(
                        'en-GB',
                        { day: 'numeric', month: 'short' },
                      )}{' '}
                      · 1 AI action
                    </Text>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="quiet"
                      size="sm"
                      disabled={coverLetterMutation.isPending}
                      onClick={() =>
                        coverLetterMutation.mutate(offer.id, {
                          onSuccess: (data) =>
                            setCoverLetterDoc(data.cvDocument),
                        })
                      }
                    >
                      {coverLetterMutation.isPending && <Spinner size="sm" />}
                      {coverLetterMutation.isPending
                        ? 'Regenerating…'
                        : 'Regenerate'}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        coverLetterEditorRef.current
                          ?.querySelector('textarea')
                          ?.focus()
                      }
                    >
                      Edit
                    </Button>
                  </div>
                </div>
                <div ref={coverLetterEditorRef}>
                  <DocumentEditor
                    key={coverLetterDoc.id}
                    documentId={coverLetterDoc.id}
                    content={coverLetterDoc.content}
                    downloadFilename="cover-letter.txt"
                    onSaved={(content) =>
                      setCoverLetterDoc((doc) =>
                        doc ? { ...doc, content } : doc,
                      )
                    }
                  />
                </div>
              </>
            ) : (
              <>
                <Heading level={4} as="h2">
                  Cover letter
                </Heading>
                <Button
                  variant="primary"
                  className="self-start"
                  disabled={coverLetterMutation.isPending}
                  onClick={() =>
                    coverLetterMutation.mutate(offer.id, {
                      onSuccess: (data) => setCoverLetterDoc(data.cvDocument),
                    })
                  }
                >
                  {coverLetterMutation.isPending && <Spinner size="sm" />}
                  {coverLetterMutation.isPending
                    ? 'Generating…'
                    : 'Generate cover letter'}
                </Button>
              </>
            )}
          </TabsContent>

          <TabsContent
            value="application"
            forceMount
            className="flex flex-col gap-6 data-[state=inactive]:hidden"
          >
            {applicationNotes || applicationTimeline ? (
              <>
                {applicationNotes}
                {applicationTimeline}
              </>
            ) : (
              <Text size="sm" color="muted">
                No application activity yet - track this offer to start a
                timeline.
              </Text>
            )}
          </TabsContent>
        </div>

        <aside className="flex flex-col gap-4">
          <Card>
            <CardContent className="flex flex-col gap-3 pt-4">
              <Grid cols={2} gap={3}>
                <StatCard
                  label="Match"
                  value={matchScore !== null ? `${matchScore}%` : 'Unknown'}
                />
                <StatCard
                  label="Callback"
                  value={fit ? `${fit.hrCallbackProbability}%` : 'Unknown'}
                />
              </Grid>
              <Button
                variant="quiet"
                size="sm"
                className="self-start"
                disabled={matchMutation.isPending}
                onClick={() =>
                  matchMutation.mutate(offer.id, {
                    onSuccess: (data) => {
                      setMatchScore(data.jobOffer.matchScore);
                      setFit(data.jobOffer.fit);
                    },
                  })
                }
              >
                {matchMutation.isPending && <Spinner size="sm" />}
                {matchMutation.isPending
                  ? 'Calculating…'
                  : matchScore !== null
                    ? 'Recalculate match'
                    : 'Calculate match'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Application</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {application ? (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Stage</span>
                    <span className="flex items-center gap-1.5">
                      <StageRing status={application.status} />
                      {APPLICATION_STATUS_LABELS[application.status]}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Tracking since
                    </span>
                    <span>{application.createdAt.toLocaleDateString()}</span>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="self-start"
                    onClick={() =>
                      downloadTextFile(
                        'sent-cv.txt',
                        application.sentCv.content,
                      )
                    }
                  >
                    Download sent CV
                  </Button>
                </>
              ) : (
                <>
                  {!sentCv && (
                    <Text size="sm" color="muted">
                      Upload a CV in Profile before tracking this application.
                    </Text>
                  )}
                  {isUsingMasterCvFallback && (
                    <Text size="sm" color="muted">
                      Tracking will use your master CV.
                    </Text>
                  )}
                  {sentCv && (
                    // Recruiter messaging now happens in the outreach panel
                    // (TASK-083), which writes its own outreach_messages rows
                    // rather than applications.recruiter_message - tracking
                    // always starts that column empty. This is always true,
                    // not a fallback that varies, so it's a plain note
                    // rather than conditional fallback copy.
                    <Text size="sm" color="muted">
                      Tracking starts with no recruiter message - draft one in
                      Outreach.
                    </Text>
                  )}
                  <Button
                    variant="primary"
                    size="sm"
                    className="self-start"
                    disabled={!canTrackApplication || isTrackingApplication}
                    onClick={() =>
                      sentCv &&
                      onTrackApplication(
                        {
                          jobOfferId: offer.id,
                          sentCvId: sentCv.id,
                          recruiterMessage: '',
                        },
                        { onSuccess: () => router.push('/offers') },
                      )
                    }
                  >
                    {isTrackingApplication && <Spinner size="sm" />}
                    {isTrackingApplication ? 'Creating…' : 'Track application'}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>About this offer</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {offer.description}
              </p>
              <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                {offer.url && (
                  <a
                    href={offer.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    View original posting
                  </a>
                )}
                <span>Added {offer.createdAt.toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </Tabs>
  );
}
