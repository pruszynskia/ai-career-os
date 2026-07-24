'use client';

import type { CvDocument } from '@/entities/cv-document/types';
import type { JobOffer } from '@/entities/job-offer/types';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useCoverLetter } from '@/features/job-offer/hooks/use-cover-letter';
import { useMatchOffer } from '@/features/job-offer/hooks/use-match-offer';
import { useRecruiterMessage } from '@/features/job-offer/hooks/use-recruiter-message';
import { useTailorCv } from '@/features/job-offer/hooks/use-tailor-cv';
import { downloadTextFile } from '@/shared/utils/download-text-file';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

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

  const sentCv = tailorCvMutation.data?.cvDocument ?? latestTailoredCv;
  const canTrackApplication =
    Boolean(sentCv) && recruiterMessageMutation.isSuccess;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{offer.title}</h1>
        <p className="text-sm text-muted-foreground">{offer.company}</p>
      </div>

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
    </div>
  );
}
