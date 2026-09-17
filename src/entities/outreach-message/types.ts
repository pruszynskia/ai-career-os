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
  // Only value ever written today (see the column default in the
  // outreach_messages migration) - a literal keeps this schema as strict
  // as the rest of the slice instead of accepting any string.
  status: z.literal('DRAFT'),
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
  status: 'DRAFT';
  createdAt: Date;
}
