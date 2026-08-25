'use client';

import type { CvDocument } from '@/entities/cv-document/types';
import type { JobOffer } from '@/entities/job-offer/types';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useCoverLetter } from '@/features/job-offer/hooks/use-cover-letter';
import { useMatchOffer } from '@/features/job-offer/hooks/use-match-offer';
import { useRecruiterMessage } from '@/features/job-offer/hooks/use-recruiter-message';
import { useTailorCv } from '@/features/job-offer/hooks/use-tailor-cv';
import { useToggleFavorite } from '@/features/job-offer/hooks/use-toggle-favorite';
import { useUpdateOffer } from '@/features/job-offer/hooks/use-update-offer';
import { AppPageLayout } from '@/shared/layouts';
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
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Label } from '@/shared/ui/primitives';

export interface CreateApplicationInput {
  jobOfferId: string;
  sentCvId: string;
  recruiterMessage: string;
}

export function OfferDetail({
  offer,
  latestTailoredCv,
  onTrackApplication,
  isTrackingApplication,
  trackApplicationError,
}: {
  offer: JobOffer;
  latestTailoredCv?: CvDocument;
  onTrackApplication: (
    input: CreateApplicationInput,
    options: { onSuccess: () => void },
  ) => void;
  isTrackingApplication: boolean;
  trackApplicationError?: string;
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

  const sentCv = tailorCvMutation.data?.cvDocument ?? latestTailoredCv;
  const canTrackApplication =
    Boolean(sentCv) && recruiterMessageMutation.isSuccess;

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
        offer.isExpired ? (
          <Badge variant="destructive">Expired</Badge>
        ) : undefined
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
                  {updateOfferMutation.isError && (
                    <p role="alert" className="text-sm text-destructive">
                      {updateOfferMutation.error.message}
                    </p>
                  )}
                  <DialogFooter>
                    <Button
                      type="submit"
                      disabled={
                        updateOfferMutation.isPending ||
                        !editValues.company.trim() ||
                        !editValues.title.trim()
                      }
                    >
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
            {matchMutation.isPending
              ? 'Calculating…'
              : matchScore !== null
                ? 'Recalculate match'
                : 'Calculate match'}
          </Button>
          {matchMutation.isError && (
            <p role="alert" className="text-sm text-destructive">
              {matchMutation.error.message}
            </p>
          )}
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
            {tailorCvMutation.isPending ? 'Tailoring…' : 'Generate tailored CV'}
          </Button>
          {tailorCvMutation.isError && (
            <p role="alert" className="text-sm text-destructive">
              {tailorCvMutation.error.message}
            </p>
          )}
          {tailorCvMutation.isSuccess && (
            <Button
              variant="outline"
              className="self-start"
              onClick={() =>
                downloadTextFile(
                  'tailored-cv.txt',
                  tailorCvMutation.data.cvDocument.content,
                )
              }
            >
              Download tailored CV
            </Button>
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
            {recruiterMessageMutation.isPending
              ? 'Generating…'
              : 'Generate recruiter message'}
          </Button>
          {recruiterMessageMutation.isError && (
            <p role="alert" className="text-sm text-destructive">
              {recruiterMessageMutation.error.message}
            </p>
          )}
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
            {coverLetterMutation.isPending
              ? 'Generating…'
              : 'Generate cover letter'}
          </Button>
          {coverLetterMutation.isError && (
            <p role="alert" className="text-sm text-destructive">
              {coverLetterMutation.error.message}
            </p>
          )}
          {coverLetterMutation.isSuccess && (
            <Button
              variant="outline"
              className="self-start"
              onClick={() =>
                downloadTextFile(
                  'cover-letter.txt',
                  coverLetterMutation.data.content,
                )
              }
            >
              Download cover letter
            </Button>
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
              Generate a tailored CV before tracking this application.
            </p>
          )}
          {sentCv && !recruiterMessageMutation.isSuccess && (
            <p className="text-sm text-muted-foreground">
              Generate a recruiter message before tracking this application.
            </p>
          )}
          <Button
            variant="secondary"
            className="self-start"
            disabled={!canTrackApplication || isTrackingApplication}
            onClick={() =>
              sentCv &&
              recruiterMessageMutation.data &&
              onTrackApplication(
                {
                  jobOfferId: offer.id,
                  sentCvId: sentCv.id,
                  recruiterMessage: recruiterMessageMutation.data.message,
                },
                { onSuccess: () => router.push('/applications') },
              )
            }
          >
            {isTrackingApplication ? 'Creating…' : 'Track application'}
          </Button>
          {trackApplicationError && (
            <p role="alert" className="text-sm text-destructive">
              {trackApplicationError}
            </p>
          )}
        </CardContent>
      </Card>
    </AppPageLayout>
  );
}
