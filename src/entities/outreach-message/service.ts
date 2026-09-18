import 'server-only';

import { createClient } from '@/shared/db/client';
import { normalizeText } from '@/shared/utils/offer-fingerprint';
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
    parentMessageId: row.parent_message_id ?? null,
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
      parentMessageId?: string | null;
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
          parent_message_id: draft.parentMessageId ?? null,
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

  // Backs the response-rate readout's by-channel grouping (TASK-085,
  // response-rate-readout.service.ts) - just enough to join an offer to the
  // channel(s) it was outreached on, no message content.
  async findChannelsByOwnerId(
    ownerId: string,
  ): Promise<{ jobOfferId: string; channel: OutreachChannel }[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('outreach_messages')
      .select('job_offer_id, channel')
      .eq('owner_id', ownerId);

    if (error) throw error;
    return (data ?? []).map((row) => ({
      jobOfferId: row.job_offer_id as string,
      channel: row.channel as OutreachChannel,
    }));
  },

  // Backs both notification nudges (TASK-086, derive-nudges.ts): the
  // follow-up nudge needs this owner's latest send per offer regardless of
  // channel/status, the pending-request nudge needs every sent connection
  // note. One bulk, no-body fetch covers both rather than two near-duplicate
  // queries.
  async findSendsByOwnerId(ownerId: string): Promise<
    {
      id: string;
      jobOfferId: string;
      channel: OutreachChannel;
      status: 'DRAFT' | 'SENT';
      contactName: string | null;
      createdAt: Date;
    }[]
  > {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('outreach_messages')
      .select('id, job_offer_id, channel, status, contact_name, created_at')
      .eq('owner_id', ownerId);

    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: row.id as string,
      jobOfferId: row.job_offer_id as string,
      channel: row.channel as OutreachChannel,
      status: row.status as 'DRAFT' | 'SENT',
      contactName: (row.contact_name as string | null) ?? null,
      createdAt: new Date(row.created_at as string),
    }));
  },

  // The most recent message for this offer, any channel - the "original"
  // a follow-up (TASK-086) references and replies on the same channel as.
  async findLatestByJobOffer(
    ownerId: string,
    jobOfferId: string,
  ): Promise<OutreachMessage | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('outreach_messages')
      .select('*')
      .eq('owner_id', ownerId)
      .eq('job_offer_id', jobOfferId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data ? toOutreachMessage(data) : null;
  },

  // The only status transition this entity ever makes (TASK-086) - the
  // outreach panel calls this when the owner copies a connection note,
  // since copying it out to LinkedIn is the closest signal the app gets to
  // "this was actually sent".
  // maybeSingle, not single: a wrong-owner or already-deleted id is a
  // legitimate "not found" case, not a server error - single() would throw
  // a Postgrest error for zero rows and the route below would 500 instead
  // of 404.
  async markSent(id: string, ownerId: string): Promise<OutreachMessage | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('outreach_messages')
      .update({ status: 'SENT' })
      .eq('id', id)
      .eq('owner_id', ownerId)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data ? toOutreachMessage(data) : null;
  },

  // Backs the per-company interlock (TASK-084, interlock.ts): who else at
  // this company got a draft addressed to them recently. Joins job_offers
  // for its company name since outreach_messages carries no company column
  // of its own, then normalizes in JS same as contacts.findByCompany -
  // company names never come from a canonical, normalized source.
  // ponytail: filters this owner's whole recent-window result set in JS
  // rather than a normalized DB-side join key; fine at personal-account
  // volume, move to a normalized/indexed company column if this ever scans
  // thousands of rows.
  async findRecentByCompany(
    ownerId: string,
    company: string,
    since: Date,
  ): Promise<{ contactName: string; createdAt: Date }[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('outreach_messages')
      .select('contact_name, created_at, job_offer:job_offers(company)')
      .eq('owner_id', ownerId)
      .not('contact_name', 'is', null)
      .gte('created_at', since.toISOString());

    if (error) throw error;

    const target = normalizeText(company);
    // Supabase's TS types can't always tell a many-to-one join from a
    // one-to-many one from the select string alone; job_offer is a single
    // row at runtime (job_offer_id is one FK), so unwrap either shape.
    const companyOf = (row: { job_offer: unknown }): string => {
      const joined = row.job_offer as
        { company: string } | { company: string }[] | null;
      return (
        (Array.isArray(joined) ? joined[0]?.company : joined?.company) ?? ''
      );
    };

    return (data ?? [])
      .filter((row) => normalizeText(companyOf(row)) === target)
      .map((row) => ({
        contactName: row.contact_name as string,
        createdAt: new Date(row.created_at as string),
      }))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },
};
