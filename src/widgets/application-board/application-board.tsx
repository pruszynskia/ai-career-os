'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { DragEventHandler } from 'react';
import { toast } from 'sonner';

import type { ApplicationStatus } from '@/entities/application/types';
import type { OfferWithApplication } from '@/features/job-offer/types';

import {
  ACTIVE_APPLICATION_STATUSES,
  APPLICATION_STATUS_LABELS,
  isTerminalApplicationStatus,
} from '@/entities/application/types';
import { ApplicationStatusSelect } from '@/features/application/components/application-status-select';
import { useCreateApplication } from '@/features/application/hooks/use-create-application';
import { useUpdateApplicationStatus } from '@/features/application/hooks/use-update-application-status';
import { StageRing } from '@/entities/application/ui/stage-ring';
import { surfaceVariants } from '@/shared/ui/primitives/surface/surface';
import { Button } from '@/shared/ui/button';
import { Tag } from '@/shared/ui/tag';
import { cn } from '@/shared/ui/utils';
import { EmptyState } from '@/shared/ui/empty-state';

// The five open stages get one column each; terminal outcomes (TASK-085)
// get one closed lane instead of four more columns.
const STATUS_COLUMNS = ACTIVE_APPLICATION_STATUSES.map(
  (status) => [status, APPLICATION_STATUS_LABELS[status]] as const,
);

// Cards shown per lane before a "+N more" affordance takes over — matches
// the mockup (3 cards visible in every capped lane).
const VISIBLE_PER_COLUMN = 3;

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
  const statusMutation = useUpdateApplicationStatus({ silent: true });
  const createMutation = useCreateApplication({ silent: true });
  const [dragOver, setDragOver] = useState<ApplicationStatus | null>(null);
  const [expandedColumns, setExpandedColumns] = useState<Set<string>>(
    new Set(),
  );

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
  const closed: OfferWithApplication[] = [];
  for (const offer of offers) {
    if (!offer.application) {
      untracked.push(offer);
    } else if (isTerminalApplicationStatus(offer.application.status)) {
      closed.push(offer);
    } else {
      tracked.get(offer.application.status)?.push(offer);
    }
  }

  function handleDrop(target: ApplicationStatus) {
    setDragOver(null);
    const source = dragged;
    if (!source) return;

    const movedLabel = (company: string | undefined) =>
      `${company ?? 'Application'} moved to ${APPLICATION_STATUS_LABELS[target]}`;

    if (source.kind === 'app') {
      if (source.status === target) return;
      const company = offers.find(
        (offer) => offer.application?.id === source.id,
      )?.company;
      statusMutation.mutate(
        { id: source.id, status: target },
        { onSuccess: () => toast.success(movedLabel(company)) },
      );
      return;
    }

    if (!masterCvId) {
      toast.error('Upload a CV in Profile before tracking this application.');
      return;
    }

    const company = offers.find(
      (offer) => offer.id === source.offerId,
    )?.company;

    createMutation.mutate(
      {
        jobOfferId: source.offerId,
        sentCvId: masterCvId,
        recruiterMessage: '',
      },
      {
        onSuccess: (data) => {
          if (target === 'APPLIED') {
            toast.success(movedLabel(company));
            router.refresh();
            return;
          }
          statusMutation.mutate(
            { id: data.application.id, status: target },
            {
              onSuccess: () => toast.success(movedLabel(company)),
              // The application already exists at APPLIED; if the follow-up
              // status write fails, still reconcile the board with what
              // persisted so the card leaves the Not tracked column.
              onError: () => router.refresh(),
            },
          );
        },
      },
    );
  }

  function expandColumn(id: string) {
    setExpandedColumns((prev) => new Set(prev).add(id));
  }

  return (
    <div
      aria-busy={isBusy}
      className={`grid grid-cols-1 gap-3 transition-opacity sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 ${
        isBusy ? 'pointer-events-none opacity-60' : ''
      }`}
    >
      {STATUS_COLUMNS.map(([status, label]) => (
        <BoardColumn
          key={status}
          label={label}
          ringStatus={status}
          offers={tracked.get(status) ?? []}
          expanded={expandedColumns.has(status)}
          onExpand={() => expandColumn(status)}
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
          className={dragOver === status ? 'border-ring bg-muted' : undefined}
        />
      ))}

      <BoardColumn
        label="Not tracked"
        ringStatus={null}
        offers={untracked}
        expanded={expandedColumns.has('untracked')}
        onExpand={() => expandColumn('untracked')}
      />

      <BoardColumn
        label="Closed"
        ringStatus="REJECTED"
        offers={closed}
        expanded={expandedColumns.has('closed')}
        onExpand={() => expandColumn('closed')}
        sunken
      />
    </div>
  );
}

// One board lane. Caps visible cards at VISIBLE_PER_COLUMN with a "+N more"
// expand control, same pattern as the list view's per-tier groups.
function BoardColumn({
  label,
  ringStatus,
  offers,
  expanded,
  onExpand,
  sunken = false,
  className,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
  label: string;
  ringStatus: ApplicationStatus | null;
  offers: OfferWithApplication[];
  expanded: boolean;
  onExpand: () => void;
  sunken?: boolean;
  className?: string;
  onDragOver?: DragEventHandler<HTMLElement>;
  onDragLeave?: DragEventHandler<HTMLElement>;
  onDrop?: DragEventHandler<HTMLElement>;
}) {
  const visible = expanded ? offers : offers.slice(0, VISIBLE_PER_COLUMN);
  const hiddenCount = offers.length - visible.length;

  return (
    <section
      aria-label={label}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(
        surfaceVariants({ padding: 'sm' }),
        'flex flex-col gap-2 rounded-lg transition-colors',
        sunken && 'bg-[var(--surface-sunken)]',
        className,
      )}
    >
      <h3 className="flex items-center gap-1.5 px-1 text-sm font-medium text-muted-foreground">
        <StageRing status={ringStatus} />
        <span className={sunken ? undefined : 'text-foreground'}>
          {label}
        </span>{' '}
        {offers.length}
      </h3>
      {visible.map((offer) => (
        <BoardCard key={offer.id} offer={offer} dimmed={sunken} />
      ))}
      {hiddenCount > 0 && (
        <Button
          type="button"
          variant="quiet"
          size="sm"
          className="justify-start text-muted-foreground"
          onClick={onExpand}
        >
          +{hiddenCount} more
        </Button>
      )}
    </section>
  );
}

// Flat card - no nested Card component (TASK-077's "no Card wraps an
// individual item" guardrail; the board column itself is the sanctioned
// exception, not the cards inside it).
function BoardCard({
  offer,
  dimmed = false,
}: {
  offer: OfferWithApplication;
  dimmed?: boolean;
}) {
  const { application } = offer;
  const statusMutation = useUpdateApplicationStatus();
  const suggestExpired =
    application &&
    offer.isExpired &&
    !isTerminalApplicationStatus(application.status);

  return (
    <div
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
      className={cn(
        surfaceVariants({ elevation: 'outlined', padding: 'sm' }),
        'flex cursor-grab flex-col gap-1 active:cursor-grabbing',
        dimmed && 'opacity-80',
      )}
    >
      <Link
        href={`/offers/${offer.id}`}
        draggable={false}
        className="truncate text-sm font-medium hover:underline"
      >
        {offer.title}
      </Link>
      <p className="truncate text-xs text-muted-foreground">
        {offer.company}
        {offer.matchScore !== null && ` · ${offer.matchScore}% match`}
      </p>
      {offer.isExpired && <Tag size="sm">Expired</Tag>}
      <div className="flex items-center justify-between gap-2">
        {application ? (
          <ApplicationStatusSelect
            applicationId={application.id}
            status={application.status}
          />
        ) : (
          <Tag size="sm" className="gap-1.5">
            <StageRing status={null} />
            Not tracked
          </Tag>
        )}
        {suggestExpired && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={statusMutation.isPending}
            onClick={() =>
              statusMutation.mutate({
                id: application.id,
                status: 'EXPIRED',
              })
            }
          >
            Mark expired?
          </Button>
        )}
      </div>
    </div>
  );
}
