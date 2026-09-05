import 'server-only';

import { createClient } from '@/shared/db/client';
import type { AiUsage } from '@/entities/ai-usage/types';

function toAiUsage(row: Record<string, unknown>): AiUsage {
  return {
    id: row.id as string,
    ownerId: row.owner_id as string,
    action: row.action as string,
    createdAt: new Date(row.created_at as string),
  };
}

// Start of the current calendar month (UTC) - the allowance period per
// docs/PRODUCT.md's "Pricing & Packaging" section. Shared by the metered
// accessor (src/shared/ai/service.ts) and the settings page usage meter so
// both count against the same window.
export function startOfCurrentMonth(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

export const aiUsageService = {
  async record(values: { ownerId: string; action: string }): Promise<AiUsage> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('ai_usage')
      .insert({ owner_id: values.ownerId, action: values.action })
      .select()
      .single();

    if (error) throw error;
    return toAiUsage(data);
  },

  async countForOwnerSince(ownerId: string, since: Date): Promise<number> {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from('ai_usage')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', ownerId)
      .gte('created_at', since.toISOString());

    if (error) throw error;
    return count ?? 0;
  },
};
