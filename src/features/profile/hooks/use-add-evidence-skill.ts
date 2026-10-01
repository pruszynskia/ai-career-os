import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';
import { toast, toastError } from '@/shared/ui/toast';

import type { EvidenceBase } from '@/entities/profile/types';
import { updateEvidenceRules } from '@/features/profile/api/profile.api';

// Adds one absent-but-true skill (TASK-079) to the profile's "always
// include when relevant" generation rule, in one action, reusing the
// TASK-078 evidence endpoint rather than a new one.
export function useAddEvidenceSkill() {
  const router = useRouter();
  // MISC-4: `evidence` is a server-component prop, which only catches up
  // after onSuccess's router.refresh() lands. Adding a second skill before
  // that refresh appended to the same stale array the first mutation
  // started from, so whichever request resolved last silently dropped the
  // other's skill. Once a mutation in this session has actually persisted,
  // every later one appends to that real result instead of the prop.
  const latestAlwaysIncludeRef = useRef<string[] | null>(null);

  return useMutation({
    mutationFn: async ({
      skill,
      evidence,
    }: {
      skill: string;
      evidence: Pick<
        EvidenceBase,
        'neverInclude' | 'alwaysIncludeWhenRelevant'
      >;
    }) => {
      const base =
        latestAlwaysIncludeRef.current ?? evidence.alwaysIncludeWhenRelevant;
      const result = await updateEvidenceRules({
        neverInclude: evidence.neverInclude,
        alwaysIncludeWhenRelevant: [...base, skill],
      });
      latestAlwaysIncludeRef.current =
        result.profile.evidence.alwaysIncludeWhenRelevant;
      return result;
    },
    onSuccess: () => {
      toast.success('Added to your profile');
      router.refresh();
    },
    onError: (error) => toastError(error.message),
  });
}
