import 'server-only';

import { createClient } from '@/shared/db/client';
import type {
  OutreachChannel,
  OutreachMessage,
} from '@/entities/outreach-message/types';
import { outreachMessageSchema } from '@/entities/outreach-message/types';

// Maps snake_case DB columns to the camelCase shape, then runs it through
// the entity's own Zod schema so a malformed row throws here rather than
// being hand-cast past the compiler and surfacing as a bug downstream.
function toOutreachMessage(row: Record<string, unknown>): OutreachMessage {
  return outreachMessageSchema.parse({
    id: row.id,
    ownerId: row.owner_id,
    jobOfferId: row.job_offer_id,
    channel: row.channel,
    subject: row.subject ?? null,
    body: row.body,
    contactName: row.contact_name ?? null,
    contactUrl: row.contact_url ?? null,
    status: row.status,
    createdAt: new Date(row.created_at as string),
  });
}

export const outreachMessageService = {
  async createMany(
    ownerId: string,
    jobOfferId: string,
    drafts: {
      channel: OutreachChannel;
      subject: string | null;
      body: string;
      contactName: string;
      contactUrl: string | null;
    }[],
  ): Promise<OutreachMessage[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('outreach_messages')
      .insert(
        drafts.map((draft) => ({
          owner_id: ownerId,
          job_offer_id: jobOfferId,
          channel: draft.channel,
          subject: draft.subject,
          body: draft.body,
          contact_name: draft.contactName,
          contact_url: draft.contactUrl,
        })),
      )
      .select();

    if (error) throw error;
    return (data ?? []).map(toOutreachMessage);
  },

  // outreach_messages.job_offer_id has no ON DELETE CASCADE (same choice
  // cv_documents made) - deleteOffer (delete-offer.service.ts) calls this
  // explicitly before deleting the offer row, or the FK rejects the delete.
  async deleteByJobOffer(jobOfferId: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('outreach_messages')
      .delete()
      .eq('job_offer_id', jobOfferId);

    if (error) throw error;
  },

  // Bodies only - the variation check (outreach-validator.ts) derives the
  // opening line, ask sentence and sign-off from each, so this stays a
  // plain data accessor rather than duplicating that parsing here.
  //
  // excludeJobOfferId is required, not optional: re-drafting the same offer
  // must not collide with the drafts it is about to replace, or every
  // regeneration for that offer 422s against itself.
  async findRecentBodies(
    ownerId: string,
    since: Date,
    excludeJobOfferId: string,
  ): Promise<string[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('outreach_messages')
      .select('body')
      .eq('owner_id', ownerId)
      .neq('job_offer_id', excludeJobOfferId)
      .gte('created_at', since.toISOString());

    if (error) throw error;
    return (data ?? []).map((row) => row.body as string);
  },
};
