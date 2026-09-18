import { z } from 'zod';

export const outreachChannelSchema = z.enum([
  'CONNECTION_NOTE',
  'DIRECT_MESSAGE',
  'EMAIL',
]);

export type OutreachChannel = z.infer<typeof outreachChannelSchema>;

export const OUTREACH_CHANNEL_LABELS: Record<OutreachChannel, string> = {
  CONNECTION_NOTE: 'Connection note',
  DIRECT_MESSAGE: 'Direct message',
  EMAIL: 'Email',
};

export const outreachMessageSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  jobOfferId: z.string(),
  channel: outreachChannelSchema,
  subject: z.string().nullable(),
  body: z.string().min(1),
  contactName: z.string().nullable(),
  contactUrl: z.string().nullable(),
  // Set only for a follow-up draft (TASK-086) - the outreach_messages row
  // it replies to.
  parentMessageId: z.string().nullable(),
  // DRAFT until the owner marks it sent (TASK-086's outreach-panel "Copy"
  // action does this for a connection note) - the pending-request nudge
  // derives from that transition. An enum, not a free string, so a typo'd
  // status can't silently fail to match either derivation.
  status: z.enum(['DRAFT', 'SENT']),
  createdAt: z.date(),
});

export interface OutreachMessage {
  id: string;
  ownerId: string;
  jobOfferId: string;
  channel: OutreachChannel;
  subject: string | null;
  body: string;
  contactName: string | null;
  contactUrl: string | null;
  parentMessageId: string | null;
  status: 'DRAFT' | 'SENT';
  createdAt: Date;
}
