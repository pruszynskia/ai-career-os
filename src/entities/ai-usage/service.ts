import 'server-only';

import { createClient } from '@/shared/db/client';

// Start of the current calendar month (UTC) - the allowance period per
// docs/PRODUCT.md's "Pricing & Packaging" section. Shared by the metered
// accessor (src/shared/ai/service.ts) and the settings page usage meter so
// both count against the same window.
export function startOfCurrentMonth(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

export const aiUsageService = {
  // Records one action for the session's owner via the record_ai_action RPC,
  // which re-counts under a per-owner lock and inserts only while under
  // `limit` - so parallel requests can't overshoot the allowance. Returns
  // false (nothing recorded) when the limit was already reached.
  async record(values: {
    action: string;
    provider?: string | null;
    limit: number;
  }): Promise<boolean> {
    const supabase = await createClient();
    const { error } = await supabase.rpc('record_ai_action', {
      p_action: values.action,
      p_provider: values.provider ?? null,
      p_limit: values.limit,
    });

    if (error?.message === 'ai_limit_reached') return false;
    if (error) throw error;
    return true;
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
