import type { Contact } from '@/entities/contact/types';

export interface ImportConnectionsResponse {
  imported: number;
  classified: number;
  skipped: number;
}

export async function importConnections(
  file: File,
): Promise<ImportConnectionsResponse> {
  const formData = new FormData();
  formData.set('file', file);

  const response = await fetch('/api/contacts/import', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(body?.message ?? 'Failed to import connections.');
  }

  return response.json();
}

export async function addContact(input: {
  name: string;
  company: string;
  title: string;
  profileUrl?: string;
}): Promise<Contact> {
  const response = await fetch('/api/contacts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  const responseBody = (await response.json().catch(() => null)) as
    | (Omit<Contact, 'createdAt'> & { createdAt: string })
    | { message?: string }
    | null;

  if (!response.ok) {
    throw new Error(
      (responseBody as { message?: string } | null)?.message ??
        'Failed to add the contact.',
    );
  }

  const contact = responseBody as Omit<Contact, 'createdAt'> & {
    createdAt: string;
  };
  return { ...contact, createdAt: new Date(contact.createdAt) };
}
