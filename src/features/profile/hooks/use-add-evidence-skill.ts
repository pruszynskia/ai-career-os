import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import type { EvidenceBase } from '@/entities/profile/types';
import { updateEvidenceRules } from '@/features/profile/api/profile.api';

// Adds one absent-but-true skill (TASK-079) to the profile's "always
// include when relevant" generation rule, in one action, reusing the
// TASK-078 evidence endpoint rather than a new one.
export function useAddEvidenceSkill() {
  const router = useRouter();

  return useMutation({
    mutationFn: ({
      skill,
      evidence,
    }: {
      skill: string;
      evidence: Pick<
        EvidenceBase,
        'neverInclude' | 'alwaysIncludeWhenRelevant'
      >;
    }) =>
      updateEvidenceRules({
        neverInclude: evidence.neverInclude,
        alwaysIncludeWhenRelevant: [
          ...evidence.alwaysIncludeWhenRelevant,
          skill,
        ],
      }),
    onSuccess: () => {
      toast.success('Added to your profile');
      router.refresh();
    },
    onError: (error) => toast.error(error.message),
  });
}
