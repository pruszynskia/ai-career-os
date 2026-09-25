'use client';

import { useState } from 'react';

import type { Contact } from '@/entities/contact/types';
import { CONTACT_CLASSIFICATION_LABELS } from '@/entities/contact/types';
import { useAddContact } from '@/features/contact/hooks/use-add-contact';
import { Badge } from '@/shared/ui/primitives/feedback/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { ListRow } from '@/shared/ui/list-row';
import {
  Avatar,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
  Text,
} from '@/shared/ui/primitives';

export interface SelectedContact {
  name: string;
  profileUrl: string | null;
}

// "JK" from "Jane Kowalska" - first + last initial, matching
// X-offer-outreach.dc.html's avatar treatment. Single-word names fall back
// to their first two letters.
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
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
    <Card>
      <CardHeader>
        <CardTitle>Who you know at {company}</CardTitle>
        <CardAction>
          <Text size="xs" color="muted">
            {contacts.length} {contacts.length === 1 ? 'contact' : 'contacts'}
          </Text>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {contacts.length === 0 ? (
          <Text size="sm" color="muted">
            No contacts on file at {company} yet.
          </Text>
        ) : (
          <>
            <Select
              value={selectedContactName ?? ''}
              onValueChange={(value) => {
                const contact = contacts.find((c) => c.name === value);
                if (contact) {
                  onSelect({ name: contact.name, profileUrl: contact.profileUrl });
                }
              }}
            >
              <SelectTrigger aria-label="Active contact" className="w-full sm:w-64">
                <SelectValue placeholder="Choose a contact" />
              </SelectTrigger>
              <SelectContent>
                {contacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.name}>
                    {contact.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex flex-col">
              {contacts.map((contact) => {
                const isSelected =
                  selectedContactName?.trim().toLowerCase() ===
                  contact.name.trim().toLowerCase();

                return (
                  <ListRow
                    key={contact.id}
                    className={isSelected ? 'bg-muted/50' : undefined}
                    leading={
                      <Avatar size="sm" fallback={getInitials(contact.name)} />
                    }
                    title={contact.name}
                    supporting={contact.title || 'No title on file'}
                    meta={
                      <Badge variant="outline" size="sm">
                        {CONTACT_CLASSIFICATION_LABELS[contact.classification]}
                      </Badge>
                    }
                  />
                );
              })}
            </div>
          </>
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
      </CardContent>
    </Card>
  );
}
