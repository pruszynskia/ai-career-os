import { requestJson } from '@/shared/api/request';
import type { Contact } from '@/entities/contact/types';

export interface ImportConnectionsResponse {
  imported: number;
  classified: number;
  skipped: number;
}

export function importConnections(
  file: File,
): Promise<ImportConnectionsResponse> {
  const formData = new FormData();
  formData.set('file', file);

  return requestJson(
    '/api/contacts/import',
    { method: 'POST', body: formData },
    'Failed to import connections.',
  );
}

export async function addContact(input: {
  name: string;
  company: string;
  title: string;
  profileUrl?: string;
}): Promise<Contact> {
  const contact = await requestJson<
    Omit<Contact, 'createdAt'> & { createdAt: string }
  >(
    '/api/contacts',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    },
    'Failed to add the contact.',
  );

  return { ...contact, createdAt: new Date(contact.createdAt) };
}
