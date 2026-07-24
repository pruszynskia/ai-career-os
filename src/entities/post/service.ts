import 'server-only';

import { createClient } from '@/shared/db/client';
import type { Post, PostStatus } from '@/entities/post/types';

function toPost(row: Record<string, unknown>): Post {
  return {
    id: row.id as string,
    ownerId: row.owner_id as string,
    content: row.content as string,
    status: row.status as PostStatus,
    scheduledAt: row.scheduled_at ? new Date(row.scheduled_at as string) : null,
    sentAt: row.sent_at ? new Date(row.sent_at as string) : null,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
  };
}

export const postService = {
  async create(values: {
    ownerId: string;
    content: string;
    status: PostStatus;
  }): Promise<Post> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('posts')
      .insert({
        owner_id: values.ownerId,
        content: values.content,
        status: values.status,
      })
      .select()
      .single();

    if (error) throw error;
    return toPost(data);
  },

  async findMany(
    filter: { ownerId: string; status?: PostStatus },
    opts?: { orderBy?: 'createdAt' | 'scheduledAt' | 'sentAt'; take?: number },
  ): Promise<Post[]> {
    const supabase = await createClient();
    let query = supabase
      .from('posts')
      .select('*')
      .eq('owner_id', filter.ownerId);

    if (filter.status) query = query.eq('status', filter.status);

    const orderColumn =
      opts?.orderBy === 'scheduledAt'
        ? 'scheduled_at'
        : opts?.orderBy === 'sentAt'
          ? 'sent_at'
          : 'created_at';
    query = query.order(orderColumn, {
      ascending: opts?.orderBy === 'scheduledAt',
    });

    if (opts?.take) query = query.limit(opts.take);

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(toPost);
  },

  async findFirst(filter: {
    id: string;
    ownerId: string;
  }): Promise<Post | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', filter.id)
      .eq('owner_id', filter.ownerId)
      .maybeSingle();

    if (error) throw error;
    return data ? toPost(data) : null;
  },

  async update(
    id: string,
    values: Partial<{
      status: PostStatus;
      scheduledAt: Date | null;
      sentAt: Date | null;
    }>,
  ): Promise<Post> {
    const supabase = await createClient();
    const patch: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (values.status !== undefined) patch.status = values.status;
    if (values.scheduledAt !== undefined)
      patch.scheduled_at = values.scheduledAt?.toISOString() ?? null;
    if (values.sentAt !== undefined)
      patch.sent_at = values.sentAt?.toISOString() ?? null;

    const { data, error } = await supabase
      .from('posts')
      .update(patch)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return toPost(data);
  },
};
