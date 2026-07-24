import 'server-only';

import { createClient } from '@/shared/db/client';
import type { Profile } from '@/entities/profile/types';

function toProfile(row: Record<string, unknown>): Profile {
  return {
    id: row.id as string,
    ownerId: row.owner_id as string,
    summary: row.summary as string,
    skills: row.skills as string[],
    experience: row.experience,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  };
}

export const profileService = {
  async findUnique(ownerId: string): Promise<Profile | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('owner_id', ownerId)
      .maybeSingle();

    if (error) throw error;
    return data ? toProfile(data) : null;
  },

  async upsert(
    ownerId: string,
    values: { summary: string; skills: string[]; experience: unknown },
  ): Promise<Profile> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        {
          owner_id: ownerId,
          summary: values.summary,
          skills: values.skills,
          experience: values.experience,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'owner_id' },
      )
      .select()
      .single();

    if (error) throw error;
    return toProfile(data);
  },
};
