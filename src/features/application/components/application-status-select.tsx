'use client';

import type { ApplicationStatus } from '@/entities/application/types';

import { APPLICATION_STATUS_LABELS } from '@/entities/application/types';
import { useUpdateApplicationStatus } from '@/features/application/hooks/use-update-application-status';
import {
  HStack,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
} from '@/shared/ui/primitives';

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
      <Select
        value={status}
        disabled={mutation.isPending}
        onValueChange={(value) =>
          mutation.mutate({
            id: applicationId,
            status: value as ApplicationStatus,
          })
        }
      >
        <SelectTrigger
          aria-label="Application status"
          aria-busy={mutation.isPending}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(APPLICATION_STATUS_LABELS).map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {mutation.isPending && <Spinner size="sm" aria-hidden />}
    </HStack>
  );
}
