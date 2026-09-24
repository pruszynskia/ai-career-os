'use client';

import { useState } from 'react';

import type { Contact } from '@/entities/contact/types';
import { CONTACT_CLASSIFICATION_LABELS } from '@/entities/contact/types';
import { useAddContact } from '@/features/contact/hooks/use-add-contact';
import { Badge } from '@/shared/ui/primitives/feedback/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Heading, Label, Spinner, Text } from '@/shared/ui/primitives';

export interface SelectedContact {
  name: string;
  profileUrl: string | null;
}

export function WhoYouKnowPanel({
  company,
  contacts,
  selectedContactName,
  onSelect,
}: {
  company: string;
  contacts: Contact[];
  selectedContactName: string | null;
  onSelect: (contact: SelectedContact) => void;
}) {
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [profileUrl, setProfileUrl] = useState('');
  const addContactMutation = useAddContact();

  function handleAdd(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;

    addContactMutation.mutate(
      {
        name: name.trim(),
        company,
        title: title.trim(),
        profileUrl: profileUrl.trim() || undefined,
      },
      {
        onSuccess: () => {
          setName('');
          setTitle('');
          setProfileUrl('');
        },
      },
    );
  }

  return (
    <section className="flex flex-col gap-3">
      <Heading level={4} as="h2">
        Who you know at {company}
      </Heading>

      {contacts.length === 0 ? (
        <Text size="sm" color="muted">
          No contacts on file at {company} yet.
        </Text>
      ) : (
        <div className="flex flex-col gap-2">
          {contacts.map((contact) => {
            const isSelected =
              selectedContactName?.trim().toLowerCase() ===
              contact.name.trim().toLowerCase();

            return (
              <div
                key={contact.id}
                className="flex items-center justify-between gap-3 rounded-md border p-2"
              >
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium">
                    {contact.name}
                  </span>
                  <span className="truncate text-sm text-muted-foreground">
                    {contact.title || 'No title on file'}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant="outline" size="sm">
                    {CONTACT_CLASSIFICATION_LABELS[contact.classification]}
                  </Badge>
                  <Button
                    variant={isSelected ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() =>
                      onSelect({
                        name: contact.name,
                        profileUrl: contact.profileUrl,
                      })
                    }
                  >
                    {isSelected ? 'Selected' : 'Select'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <form
        onSubmit={handleAdd}
        className="flex flex-col gap-2 sm:flex-row sm:items-end"
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="new-contact-name">Add a contact at {company}</Label>
          <Input
            id="new-contact-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Name"
            disabled={addContactMutation.isPending}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="new-contact-title">Title</Label>
          <Input
            id="new-contact-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Engineering Manager"
            disabled={addContactMutation.isPending}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="new-contact-url">LinkedIn URL (optional)</Label>
          <Input
            id="new-contact-url"
            value={profileUrl}
            onChange={(event) => setProfileUrl(event.target.value)}
            placeholder="https://linkedin.com/in/..."
            disabled={addContactMutation.isPending}
          />
        </div>
        <Button
          type="submit"
          variant="primary"
          disabled={!name.trim() || addContactMutation.isPending}
          className="self-start"
        >
          {addContactMutation.isPending && <Spinner size="sm" />}
          {addContactMutation.isPending ? 'Adding…' : 'Add contact'}
        </Button>
      </form>
    </section>
  );
}
