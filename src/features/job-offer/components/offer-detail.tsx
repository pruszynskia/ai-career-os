'use client';

import type { CvDocument } from '@/entities/cv-document/types';
import type { JobOffer } from '@/entities/job-offer/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';

import { DeleteOfferButton } from '@/features/job-offer/components/delete-offer-button';
import { FitReport } from '@/features/job-offer/components/fit-report';
import { OutreachPanel } from '@/features/job-offer/components/outreach-panel';
import { useCoverLetter } from '@/features/job-offer/hooks/use-cover-letter';
import { useMatchOffer } from '@/features/job-offer/hooks/use-match-offer';
import { useTailorCv } from '@/features/job-offer/hooks/use-tailor-cv';
import { useToggleFavorite } from '@/features/job-offer/hooks/use-toggle-favorite';
import { useUpdateOffer } from '@/features/job-offer/hooks/use-update-offer';
import { AppPageLayout } from '@/shared/layouts';
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
import { EmptyState } from '@/shared/ui/empty-state';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Divider, Heading, Label, Spinner } from '@/shared/ui/primitives';

export interface CreateApplicationInput {
  jobOfferId: string;
  sentCvId: string;
  recruiterMessage: string;
}

export function OfferDetail({
  offer,
  latestTailoredCv,
  masterCv,
  onTrackApplication,
  isTrackingApplication,
  applicationTimeline,
  applicationNotes,
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
  const [matchScore, setMatchScore] = useState(offer.matchScore);
  const [fit, setFit] = useState(offer.fit);
  const [selectedContact, setSelectedContact] = useState<{
    name: string;
    profileUrl: string | null;
  } | null>(null);
  const matchMutation = useMatchOffer();
  const tailorCvMutation = useTailorCv();
  const coverLetterMutation = useCoverLetter();
  const toggleFavoriteMutation = useToggleFavorite();
  const updateOfferMutation = useUpdateOffer();
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
    <AppPageLayout
      title={offer.title}
      subtitle={offer.company}
      action={
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {offer.isExpired && <Badge variant="destructive">Expired</Badge>}
          <span>
            {offer.expiresAt
              ? `Expires on ${offer.expiresAt.toLocaleDateString()}`
              : 'No expiration set'}
          </span>
          <DeleteOfferButton offerId={offer.id} redirectTo="/offers" />
        </div>
      }
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <Card className="w-full lg:sticky lg:top-6 lg:w-80 lg:shrink-0 lg:max-h-[calc(100svh-3rem)] lg:overflow-y-auto">
          <CardHeader>
            <CardTitle>Offer details</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="whitespace-pre-wrap text-sm">{offer.description}</p>
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
            <div className="flex flex-wrap gap-2">
              <Button
                variant={offer.isFavorite ? 'default' : 'outline'}
                size="sm"
                disabled={toggleFavoriteMutation.isPending}
                onClick={() =>
                  toggleFavoriteMutation.mutate({
                    id: offer.id,
                    isFavorite: !offer.isFavorite,
                  })
                }
              >
                {toggleFavoriteMutation.isPending && <Spinner size="sm" />}
                {offer.isFavorite ? 'Favorited' : 'Favorite'}
              </Button>
              <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" onClick={openEditDialog}>
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
            </div>

            <Divider />

            <div className="flex flex-col gap-2">
              <Heading level={6} as="h2" className="text-muted-foreground">
                Match
              </Heading>
              {matchScore !== null && (
                <p className="text-2xl font-semibold">{matchScore}%</p>
              )}
              <Button
                variant="secondary"
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
            </div>

            <Divider />

            <div className="flex flex-col gap-2">
              <Heading level={6} as="h2" className="text-muted-foreground">
                Track application
              </Heading>
              {!sentCv && (
                <p className="text-sm text-muted-foreground">
                  Upload a CV in Profile before tracking this application.
                </p>
              )}
              {isUsingMasterCvFallback && (
                <p className="text-sm text-muted-foreground">
                  Tracking will use your master CV.
                </p>
              )}
              {sentCv && (
                // Recruiter messaging now happens in the outreach panel
                // above (TASK-083), which writes its own outreach_messages
                // rows rather than applications.recruiter_message -
                // tracking always starts that column empty. This is always
                // true, not a fallback that varies, so it's a plain note
                // rather than conditional fallback copy.
                <p className="text-sm text-muted-foreground">
                  Tracking starts with no recruiter message - draft one in
                  Outreach above.
                </p>
              )}
              <Button
                variant="secondary"
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
            </div>
          </CardContent>
        </Card>

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          {matchScore !== null && (
            <>
              {!canViewFitDetail ? (
                // Free: always the upgrade prompt, regardless of whether
                // fit was ever computed for this offer.
                <EmptyState
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
                  // entities/job-offer/service.ts) - nothing to gate, so
                  // stay silent instead of telling a paying user to upgrade.
                  <FitReport
                    matchScore={matchScore}
                    fit={fit}
                    alwaysIncludeWhenRelevant={alwaysIncludeWhenRelevant}
                    onAddSkill={onAddSkill}
                    addingSkill={addingSkill}
                  />
                )
              )}
              <Divider />
            </>
          )}

          <section className="flex flex-col gap-3">
            <Heading level={4} as="h2">
              Tailored CV
            </Heading>
            <Button
              variant="secondary"
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
          </section>

          <Divider />

          {renderWhoYouKnow && (
            <>
              {renderWhoYouKnow({
                onSelect: setSelectedContact,
                selectedContactName: selectedContact?.name ?? null,
              })}
              <Divider />
            </>
          )}

          <OutreachPanel
            offerId={offer.id}
            selectedContact={selectedContact}
            interlockWarning={interlockWarning}
          />

          <Divider />

          <section className="flex flex-col gap-3">
            <Heading level={4} as="h2">
              Cover letter
            </Heading>
            <Button
              variant="secondary"
              className="self-start"
              disabled={coverLetterMutation.isPending}
              onClick={() => coverLetterMutation.mutate(offer.id)}
            >
              {coverLetterMutation.isPending && <Spinner size="sm" />}
              {coverLetterMutation.isPending
                ? 'Generating…'
                : 'Generate cover letter'}
            </Button>
            {coverLetterMutation.isSuccess && (
              <DocumentEditor
                key={coverLetterMutation.data.cvDocument.id}
                documentId={coverLetterMutation.data.cvDocument.id}
                content={coverLetterMutation.data.cvDocument.content}
                downloadFilename="cover-letter.txt"
              />
            )}
          </section>

          {applicationNotes}

          {applicationTimeline}
        </div>
      </div>
    </AppPageLayout>
  );
}
