import { z } from 'zod';

export const contactClassificationSchema = z.enum([
  'non-it',
  'generalist',
  'it-recruiter',
  'decision-maker',
]);

export type ContactClassification = z.infer<typeof contactClassificationSchema>;

export const CONTACT_CLASSIFICATION_LABELS: Record<
  ContactClassification,
  string
> = {
  'non-it': 'Non-IT / HR',
  generalist: 'Generalist',
  'it-recruiter': 'IT recruiter',
  'decision-maker': 'Decision maker',
};

export const contactSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  name: z.string().min(1),
  company: z.string().min(1),
  title: z.string(),
  profileUrl: z.string().nullable(),
  classification: contactClassificationSchema,
  firstDegree: z.boolean(),
  createdAt: z.date(),
});

export type Contact = z.infer<typeof contactSchema>;
