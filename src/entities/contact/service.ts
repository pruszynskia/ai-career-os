import 'server-only';

import { createClient } from '@/shared/db/client';
import { normalizeText } from '@/shared/utils/offer-fingerprint';
import type { Contact, ContactClassification } from '@/entities/contact/types';
import { contactSchema } from '@/entities/contact/types';

function toContact(row: Record<string, unknown>): Contact {
  return contactSchema.parse({
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    company: row.company,
    title: row.title,
    profileUrl: row.profile_url ?? null,
    classification: row.classification,
    firstDegree: row.first_degree,
    createdAt: new Date(row.created_at as string),
  });
}

// it-recruiter/decision-maker are the two categories worth reaching out to
// first for a warm intro (ADR-021) - non-it and generalist still show, just
// lower in the list.
const SPECIALIST_CLASSIFICATIONS: ContactClassification[] = [
  'it-recruiter',
  'decision-maker',
];

function rankScore(contact: Contact): number {
  const degreeScore = contact.firstDegree ? 0 : 2;
  const classificationScore = SPECIALIST_CLASSIFICATIONS.includes(
    contact.classification,
  )
    ? 0
    : 1;
  return degreeScore + classificationScore;
}

export interface NewContact {
  name: string;
  company: string;
  title: string;
  profileUrl: string | null;
  classification: ContactClassification;
  firstDegree: boolean;
}

function toRow(ownerId: string, input: NewContact) {
  return {
    owner_id: ownerId,
    name: input.name,
    company: input.company,
    normalized_company: normalizeText(input.company),
    title: input.title,
    profile_url: input.profileUrl,
    classification: input.classification,
    first_degree: input.firstDegree,
  };
}

// A single insert/select statement is capped by config.toml's max_rows
// (1000) and by the request body size, so an import bigger than that would
// silently under-report on both ends. A personal LinkedIn export tops out
// far below this in practice, but chunking is free insurance.
const INSERT_CHUNK_SIZE = 500;

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export const contactService = {
  async create(ownerId: string, input: NewContact): Promise<Contact> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('contacts')
      .insert(toRow(ownerId, input))
      .select()
      .single();

    if (error) throw error;
    return toContact(data);
  },

  // Skips rows whose profile_url already exists for this owner, so
  // re-importing a refreshed export doesn't duplicate every contact
  // (contacts.contacts_owner_profile_url_key backs this up at the DB level
  // for the race case; rows with no profile_url always insert, same as the
  // manual-add path).
  async createMany(ownerId: string, inputs: NewContact[]): Promise<Contact[]> {
    if (inputs.length === 0) return [];

    const supabase = await createClient();

    const profileUrls = inputs
      .map((input) => input.profileUrl)
      .filter((url): url is string => Boolean(url));

    // Chunked like the inserts below - a real export's profile_url list can
    // run into the hundreds/thousands and blow PostgREST's URL length limit
    // if sent as a single .in(...) filter.
    const existingUrls = new Set<string>();
    for (const batch of chunk(profileUrls, INSERT_CHUNK_SIZE)) {
      const { data, error } = await supabase
        .from('contacts')
        .select('profile_url')
        .eq('owner_id', ownerId)
        .in('profile_url', batch);

      if (error) throw error;
      for (const row of data ?? []) {
        if (row.profile_url) existingUrls.add(row.profile_url as string);
      }
    }

    const toInsert = inputs.filter(
      (input) => !input.profileUrl || !existingUrls.has(input.profileUrl),
    );

    const created: Contact[] = [];
    for (const batch of chunk(toInsert, INSERT_CHUNK_SIZE)) {
      const { data, error } = await supabase
        .from('contacts')
        .insert(batch.map((input) => toRow(ownerId, input)))
        .select();

      if (error) throw error;
      created.push(...(data ?? []).map(toContact));
    }

    return created;
  },

  async findAllByOwnerId(ownerId: string): Promise<Contact[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(toContact);
  },

  async findByCompany(ownerId: string, company: string): Promise<Contact[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('owner_id', ownerId)
      .eq('normalized_company', normalizeText(company));

    if (error) throw error;

    return (data ?? [])
      .map(toContact)
      .sort((a, b) => rankScore(a) - rankScore(b));
  },
};
