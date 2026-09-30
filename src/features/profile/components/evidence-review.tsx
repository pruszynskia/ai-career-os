'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast, toastError } from '@/shared/ui/toast';

import type { Claim, ClaimState, EvidenceBase } from '@/entities/profile/types';
import { updateEvidenceRules } from '@/features/profile/api/profile.api';
import { toList } from '@/features/profile/utils/preferences-form';
import { AsyncButton } from '@/shared/ui/async-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Field } from '@/shared/ui/field';
import {
  Input,
  Tag,
  Text,
  VStack,
  surfaceVariants,
} from '@/shared/ui/primitives';
import { cn } from '@/shared/ui/utils';

const CLAIM_KIND_LABEL: Record<Claim['kind'], string> = {
  skill: 'Skill',
  experience: 'Experience',
  project: 'Project',
};

export function EvidenceReview({ evidence }: { evidence: EvidenceBase }) {
  const router = useRouter();
  const claimMutation = useMutation({
    mutationFn: ({ claimId, state }: { claimId: string; state: ClaimState }) =>
      updateEvidenceRules({ claimId, state }),
    onSuccess: () => router.refresh(),
    onError: (error: Error) => toastError(error.message),
  });

  const pendingClaims = evidence.claims.filter(
    (claim) => claim.riskLevel === 'high' && claim.state === 'TRUSTED',
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evidence review</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {pendingClaims.length > 0 && (
          <VStack gap={3}>
            <Text size="sm" color="muted">
              {pendingClaims.length} claim
              {pendingClaims.length === 1 ? '' : 's'} need confirmation
            </Text>
            {pendingClaims.map((claim) => {
              const isPending =
                claimMutation.isPending &&
                claimMutation.variables?.claimId === claim.id;
              const pendingState = claimMutation.variables?.state;

              return (
                <div
                  key={claim.id}
                  className={cn(
                    surfaceVariants({ elevation: 'ruled', padding: 'sm' }),
                    'flex flex-col gap-2 last:border-b-0 sm:flex-row sm:items-center sm:justify-between',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Tag>{CLAIM_KIND_LABEL[claim.kind]}</Tag>
                    <Text size="sm">{claim.text}</Text>
                  </div>
                  <div className="flex gap-2">
                    <AsyncButton
                      type="button"
                      size="sm"
                      pending={isPending && pendingState === 'CONFIRMED'}
                      // Disabled while ANY claim mutation is in flight, not
                      // just this row's (AI-5): two rows mutating at once
                      // race a read-modify-write of the same evidence JSON
                      // column, and the second write silently drops the
                      // first's change.
                      disabled={claimMutation.isPending}
                      onClick={() =>
                        claimMutation.mutate({
                          claimId: claim.id,
                          state: 'CONFIRMED',
                        })
                      }
                    >
                      Confirm
                    </AsyncButton>
                    <AsyncButton
                      type="button"
                      size="sm"
                      variant="secondary"
                      pending={isPending && pendingState === 'FLAGGED'}
                      disabled={claimMutation.isPending}
                      onClick={() =>
                        claimMutation.mutate({
                          claimId: claim.id,
                          state: 'FLAGGED',
                        })
                      }
                    >
                      Flag
                    </AsyncButton>
                    <AsyncButton
                      type="button"
                      size="sm"
                      variant="danger"
                      pending={isPending && pendingState === 'EXCLUDED'}
                      disabled={claimMutation.isPending}
                      onClick={() =>
                        claimMutation.mutate({
                          claimId: claim.id,
                          state: 'EXCLUDED',
                        })
                      }
                    >
                      Exclude
                    </AsyncButton>
                  </div>
                </div>
              );
            })}
          </VStack>
        )}

        <RulesEditor evidence={evidence} />
      </CardContent>
    </Card>
  );
}

function RulesEditor({ evidence }: { evidence: EvidenceBase }) {
  const router = useRouter();
  const [neverInclude, setNeverInclude] = useState(
    evidence.neverInclude.join(', '),
  );
  const [alwaysIncludeWhenRelevant, setAlwaysIncludeWhenRelevant] = useState(
    evidence.alwaysIncludeWhenRelevant.join(', '),
  );

  const rulesMutation = useMutation({
    mutationFn: (rules: {
      neverInclude: string[];
      alwaysIncludeWhenRelevant: string[];
    }) => updateEvidenceRules(rules),
    onSuccess: () => {
      toast.success('Generation rules saved');
      router.refresh();
    },
    onError: (error: Error) => toastError(error.message),
  });

  return (
    <VStack gap={3}>
      <Text size="sm" weight="medium">
        Generation rules
      </Text>
      <Field id="neverInclude" label="Never include (comma-separated)">
        <Input
          placeholder="e.g. previous employer's name"
          value={neverInclude}
          onChange={(event) => setNeverInclude(event.target.value)}
        />
      </Field>
      <Field
        id="alwaysIncludeWhenRelevant"
        label="Always include when relevant (comma-separated)"
      >
        <Input
          placeholder="e.g. AWS certification"
          value={alwaysIncludeWhenRelevant}
          onChange={(event) => setAlwaysIncludeWhenRelevant(event.target.value)}
        />
      </Field>
      <AsyncButton
        type="button"
        size="sm"
        className="self-start"
        pending={rulesMutation.isPending}
        pendingLabel="Saving…"
        onClick={() =>
          rulesMutation.mutate({
            neverInclude: toList(neverInclude),
            alwaysIncludeWhenRelevant: toList(alwaysIncludeWhenRelevant),
          })
        }
      >
        Save rules
      </AsyncButton>
    </VStack>
  );
}
