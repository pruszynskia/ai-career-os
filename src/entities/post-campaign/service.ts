import 'server-only';

import { createClient } from '@/shared/db/client';
import type { PostCampaign } from '@/entities/post-campaign/types';

function toPostCampaign(row: Record<string, unknown>): PostCampaign {
  return {
    id: row.id as string,
    ownerId: row.owner_id as string,
    theme: row.theme as string,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  };
}

export const postCampaignService = {
  async create(values: {
    ownerId: string;
    theme: string;
  }): Promise<PostCampaign> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('post_campaigns')
      .insert({ owner_id: values.ownerId, theme: values.theme })
      .select()
      .single();

    if (error) throw error;
    return toPostCampaign(data);
  },

  async findMany(filter: { ownerId: string }): Promise<PostCampaign[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('post_campaigns')
      .select('*')
      .eq('owner_id', filter.ownerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(toPostCampaign);
  },

  // Unused for now — kept for parity with the entity-service convention
  // (e.g. src/entities/post/service.ts); a campaign-detail view is the
  // expected future consumer.
  async findFirst(filter: {
    id: string;
    ownerId: string;
  }): Promise<PostCampaign | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('post_campaigns')
      .select('*')
      .eq('id', filter.id)
      .eq('owner_id', filter.ownerId)
      .maybeSingle();

    if (error) throw error;
    return data ? toPostCampaign(data) : null;
  },

  async remove(id: string, ownerId: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('post_campaigns')
      .delete()
      .eq('id', id)
      .eq('owner_id', ownerId);

    if (error) throw error;
  },
};
