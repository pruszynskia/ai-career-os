'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import type { Claim, ClaimState, EvidenceBase } from '@/entities/profile/types';
import { toList } from '@/features/profile/utils/preferences-form';
import { AsyncButton } from '@/shared/ui/async-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Field } from '@/shared/ui/field';
import { Badge, Input, Text, VStack } from '@/shared/ui/primitives';

async function patchEvidence(body: unknown) {
  const response = await fetch('/api/profile/evidence', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(
      errorBody?.message ?? 'Failed to update your evidence base.',
    );
  }

  return response.json();
}

const CLAIM_KIND_LABEL: Record<Claim['kind'], string> = {
  skill: 'Skill',
  experience: 'Experience',
  project: 'Project',
};

export function EvidenceReview({ evidence }: { evidence: EvidenceBase }) {
  const router = useRouter();
  const claimMutation = useMutation({
    mutationFn: ({ claimId, state }: { claimId: string; state: ClaimState }) =>
      patchEvidence({ claimId, state }),
    onSuccess: () => router.refresh(),
    onError: (error: Error) => toast.error(error.message),
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
                  className="flex flex-col gap-2 rounded-xs border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {CLAIM_KIND_LABEL[claim.kind]}
                    </Badge>
                    <Text size="sm">{claim.text}</Text>
                  </div>
                  <div className="flex gap-2">
                    <AsyncButton
                      type="button"
                      size="sm"
                      pending={isPending && pendingState === 'CONFIRMED'}
                      disabled={isPending && pendingState !== 'CONFIRMED'}
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
                      variant="outline"
                      pending={isPending && pendingState === 'FLAGGED'}
                      disabled={isPending && pendingState !== 'FLAGGED'}
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
                      variant="destructive"
                      pending={isPending && pendingState === 'EXCLUDED'}
                      disabled={isPending && pendingState !== 'EXCLUDED'}
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
    }) => patchEvidence(rules),
    onSuccess: () => {
      toast.success('Generation rules saved');
      router.refresh();
    },
    onError: (error: Error) => toast.error(error.message),
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
