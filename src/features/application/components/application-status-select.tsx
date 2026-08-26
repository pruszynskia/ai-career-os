'use client';

import type { ApplicationStatus } from '@/entities/application/types';

import { APPLICATION_STATUS_LABELS } from '@/entities/application/types';
import { useUpdateApplicationStatus } from '@/features/application/hooks/use-update-application-status';
import { HStack, Spinner } from '@/shared/ui/primitives';

export function ApplicationStatusSelect({
  applicationId,
  status,
}: {
  applicationId: string;
  status: ApplicationStatus;
}) {
  const mutation = useUpdateApplicationStatus();

  return (
    <HStack gap={2} align="center">
      <select
        value={status}
        disabled={mutation.isPending}
        aria-busy={mutation.isPending}
        onChange={(event) =>
          mutation.mutate({
            id: applicationId,
            status: event.target.value as ApplicationStatus,
          })
        }
        aria-label="Application status"
        className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
      >
        {Object.entries(APPLICATION_STATUS_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      {mutation.isPending && <Spinner size="sm" aria-hidden />}
    </HStack>
  );
}
