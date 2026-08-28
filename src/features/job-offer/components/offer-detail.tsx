'use client';

import type { CvDocument } from '@/entities/cv-document/types';
import type { JobOffer } from '@/entities/job-offer/types';
import { useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';

import { DeleteOfferButton } from '@/features/job-offer/components/delete-offer-button';
import { useCoverLetter } from '@/features/job-offer/hooks/use-cover-letter';
import { useMatchOffer } from '@/features/job-offer/hooks/use-match-offer';
import { useRecruiterMessage } from '@/features/job-offer/hooks/use-recruiter-message';
import { useTailorCv } from '@/features/job-offer/hooks/use-tailor-cv';
import { useToggleFavorite } from '@/features/job-offer/hooks/use-toggle-favorite';
import { useUpdateOffer } from '@/features/job-offer/hooks/use-update-offer';
import { AppPageLayout } from '@/shared/layouts';
import { Badge } from '@/shared/ui/primitives/feedback/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { DocumentEditor } from '@/shared/ui/document-editor';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Label, Spinner } from '@/shared/ui/primitives';

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
}) {
  const router = useRouter();
  const [matchScore, setMatchScore] = useState(offer.matchScore);
  const matchMutation = useMatchOffer();
  const tailorCvMutation = useTailorCv();
  const recruiterMessageMutation = useRecruiterMessage();
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
  const sentCv = tailoredCv ?? masterCv;
  const canTrackApplication = Boolean(sentCv);
  const isUsingMasterCvFallback = Boolean(sentCv) && !tailoredCv;
  const isUsingEmptyMessageFallback =
    Boolean(sentCv) && !recruiterMessageMutation.isSuccess;
  const isUsingFallback =
    isUsingMasterCvFallback || isUsingEmptyMessageFallback;

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
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="whitespace-pre-wrap text-sm">{offer.description}</p>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Match</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {matchScore !== null && (
            <p className="text-2xl font-semibold">{matchScore}%</p>
          )}
          <Button
            variant="secondary"
            className="self-start"
            disabled={matchMutation.isPending}
            onClick={() =>
              matchMutation.mutate(offer.id, {
                onSuccess: (data) => setMatchScore(data.jobOffer.matchScore),
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
          <CardTitle>Tailored CV</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button
            variant="secondary"
            className="self-start"
            disabled={tailorCvMutation.isPending}
            onClick={() => tailorCvMutation.mutate(offer.id)}
          >
            {tailorCvMutation.isPending && <Spinner size="sm" />}
            {tailorCvMutation.isPending ? 'Tailoring…' : 'Generate tailored CV'}
          </Button>
          {tailorCvMutation.isSuccess && (
            <DocumentEditor
              key={tailorCvMutation.data.cvDocument.id}
              documentId={tailorCvMutation.data.cvDocument.id}
              content={tailorCvMutation.data.cvDocument.content}
              downloadFilename="tailored-cv.txt"
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recruiter message</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button
            variant="secondary"
            className="self-start"
            disabled={recruiterMessageMutation.isPending}
            onClick={() => recruiterMessageMutation.mutate(offer.id)}
          >
            {recruiterMessageMutation.isPending && <Spinner size="sm" />}
            {recruiterMessageMutation.isPending
              ? 'Generating…'
              : 'Generate recruiter message'}
          </Button>
          {recruiterMessageMutation.isSuccess && (
            <p className="whitespace-pre-wrap text-sm">
              {recruiterMessageMutation.data.message}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cover Letter</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Track application</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {!sentCv && (
            <p className="text-sm text-muted-foreground">
              Upload a CV in Profile before tracking this application.
            </p>
          )}
          {isUsingFallback && (
            <p className="text-sm text-muted-foreground">
              Tracking will use{' '}
              {isUsingMasterCvFallback ? 'your master CV' : 'the tailored CV'}
              {isUsingEmptyMessageFallback && ' and an empty recruiter message'}
              .
            </p>
          )}
          <Button
            variant="secondary"
            className="self-start"
            disabled={!canTrackApplication || isTrackingApplication}
            onClick={() =>
              sentCv &&
              onTrackApplication(
                {
                  jobOfferId: offer.id,
                  sentCvId: sentCv.id,
                  recruiterMessage:
                    recruiterMessageMutation.data?.message ?? '',
                },
                { onSuccess: () => router.push('/offers') },
              )
            }
          >
            {isTrackingApplication && <Spinner size="sm" />}
            {isTrackingApplication ? 'Creating…' : 'Track application'}
          </Button>
        </CardContent>
      </Card>

      {applicationNotes}

      {applicationTimeline}
    </AppPageLayout>
  );
}
