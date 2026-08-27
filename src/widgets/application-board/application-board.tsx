'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import type { ApplicationStatus } from '@/entities/application/types';
import type { OfferWithApplication } from '@/features/job-offer/types';

import { APPLICATION_STATUS_LABELS } from '@/entities/application/types';
import { ApplicationStatusSelect } from '@/features/application/components/application-status-select';
import { useCreateApplication } from '@/features/application/hooks/use-create-application';
import { useUpdateApplicationStatus } from '@/features/application/hooks/use-update-application-status';
import { Badge } from '@/shared/ui/primitives/feedback/badge';
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';

const STATUS_COLUMNS = Object.entries(APPLICATION_STATUS_LABELS) as [
  ApplicationStatus,
  string,
][];

// Module-scoped handle for the card being dragged. Native drag events only
// carry strings; keeping the source here lets the drop handler tell a status
// change (tracked card) from a track-on-drop (untracked offer) without
// re-parsing the payload.
type Dragged =
  | { kind: 'app'; id: string; status: ApplicationStatus }
  | { kind: 'offer'; offerId: string };

let dragged: Dragged | null = null;

// Board rendering of the same OfferWithApplication[] the list view uses:
// one column per application status plus a Not tracked column. Dropping a
// tracked card on another column calls the existing status mutation;
// dropping an untracked card creates its application (master CV, empty
// recruiter message) and then sets the dropped status — no new API surface
// (TASK-049).
export function ApplicationBoard({
  offers,
  isFiltered = false,
  masterCvId,
}: {
  offers: OfferWithApplication[];
  isFiltered?: boolean;
  masterCvId?: string;
}) {
  const router = useRouter();
  const statusMutation = useUpdateApplicationStatus();
  const createMutation = useCreateApplication();
  const [dragOver, setDragOver] = useState<ApplicationStatus | null>(null);

  const isBusy = statusMutation.isPending || createMutation.isPending;

  if (offers.length === 0) {
    return (
      <EmptyState
        message={
          isFiltered
            ? 'No offers match your filters.'
            : 'No offers yet — add one above.'
        }
      />
    );
  }

  const tracked = new Map<ApplicationStatus, OfferWithApplication[]>(
    STATUS_COLUMNS.map(([status]) => [status, []]),
  );
  const untracked: OfferWithApplication[] = [];
  for (const offer of offers) {
    if (offer.application) tracked.get(offer.application.status)?.push(offer);
    else untracked.push(offer);
  }

  function handleDrop(target: ApplicationStatus) {
    setDragOver(null);
    if (!dragged) return;

    if (dragged.kind === 'app') {
      if (dragged.status === target) return;
      statusMutation.mutate({ id: dragged.id, status: target });
      return;
    }

    if (!masterCvId) {
      toast.error('Upload a CV in Profile before tracking this application.');
      return;
    }

    createMutation.mutate(
      {
        jobOfferId: dragged.offerId,
        sentCvId: masterCvId,
        recruiterMessage: '',
      },
      {
        onSuccess: (data) => {
          if (target === 'APPLIED') {
            router.refresh();
            return;
          }
          statusMutation.mutate(
            { id: data.application.id, status: target },
            // The application already exists at APPLIED; if the follow-up
            // status write fails, still reconcile the board with what
            // persisted so the card leaves the Not tracked column.
            { onError: () => router.refresh() },
          );
        },
      },
    );
  }

  return (
    <div
      aria-busy={isBusy}
      className={`grid grid-cols-1 gap-3 transition-opacity sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 ${
        isBusy ? 'pointer-events-none opacity-60' : ''
      }`}
    >
      {STATUS_COLUMNS.map(([status, label]) => (
        <section
          key={status}
          aria-label={label}
          onDragOver={(event) => {
            event.preventDefault();
            setDragOver(status);
          }}
          onDragLeave={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node)) {
              setDragOver(null);
            }
          }}
          onDrop={(event) => {
            event.preventDefault();
            handleDrop(status);
          }}
          className={`flex flex-col gap-2 rounded-lg border p-2 transition-colors ${
            dragOver === status ? 'border-ring bg-muted' : 'border-border'
          }`}
        >
          <h3 className="px-1 text-sm font-medium">
            {label}{' '}
            <span className="text-muted-foreground">
              {tracked.get(status)?.length ?? 0}
            </span>
          </h3>
          {tracked.get(status)?.map((offer) => (
            <BoardCard key={offer.id} offer={offer} />
          ))}
        </section>
      ))}

      <section
        aria-label="Not tracked"
        className="flex flex-col gap-2 rounded-lg border border-border p-2"
      >
        <h3 className="px-1 text-sm font-medium">
          Not tracked{' '}
          <span className="text-muted-foreground">{untracked.length}</span>
        </h3>
        {untracked.map((offer) => (
          <BoardCard key={offer.id} offer={offer} />
        ))}
      </section>
    </div>
  );
}

function BoardCard({ offer }: { offer: OfferWithApplication }) {
  const { application } = offer;

  return (
    <Card
      size="sm"
      draggable
      onDragStart={(event) => {
        dragged = application
          ? { kind: 'app', id: application.id, status: application.status }
          : { kind: 'offer', offerId: offer.id };
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', application?.id ?? offer.id);
      }}
      onDragEnd={() => {
        dragged = null;
      }}
      className="cursor-grab active:cursor-grabbing"
    >
      <CardHeader>
        <CardTitle className="text-sm">
          <Link
            href={`/offers/${offer.id}`}
            draggable={false}
            className="hover:underline"
          >
            {offer.title}
          </Link>
        </CardTitle>
        <CardDescription>
          {offer.company}
          {offer.matchScore !== null && ` · ${offer.matchScore}% match`}
          {offer.isExpired && (
            <Badge variant="destructive" className="ml-2">
              Expired
            </Badge>
          )}
        </CardDescription>
        {application ? (
          <CardAction>
            <ApplicationStatusSelect
              applicationId={application.id}
              status={application.status}
            />
          </CardAction>
        ) : (
          <CardAction>
            <Badge variant="outline">Not tracked</Badge>
          </CardAction>
        )}
      </CardHeader>
    </Card>
  );
}
