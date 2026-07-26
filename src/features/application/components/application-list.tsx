'use client';

import Link from 'next/link';

import type { ApplicationBundle } from '@/entities/application/types';
import { ApplicationStatusSelect } from '@/features/application/components/application-status-select';
import { downloadTextFile } from '@/shared/utils/download-text-file';
import { Badge } from '@/shared/ui/primitives/feedback/badge';
import { Button } from '@/shared/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';

export function ApplicationList({
  applications,
  emptyMessage = 'No applications yet.',
}: {
  applications: ApplicationBundle[];
  emptyMessage?: string;
}) {
  if (applications.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div className="flex flex-col gap-3">
      {applications.map((application) => (
        <Card key={application.id}>
          <CardHeader>
            <CardTitle>
              <Link
                href={`/offers/${application.jobOffer.id}`}
                className="hover:underline"
              >
                {application.jobOffer.title}
              </Link>
            </CardTitle>
            <CardDescription>
              {application.jobOffer.company}
              {application.isExpired && (
                <Badge variant="destructive" className="ml-2">
                  Expired
                </Badge>
              )}
            </CardDescription>
            <CardAction>
              <ApplicationStatusSelect
                applicationId={application.id}
                status={application.status}
              />
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="whitespace-pre-wrap text-sm">
              {application.recruiterMessage}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="self-start"
              onClick={() =>
                downloadTextFile('sent-cv.txt', application.sentCv.content)
              }
            >
              Download sent CV
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
