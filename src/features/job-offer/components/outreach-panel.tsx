'use client';

import { useState } from 'react';

import type { OutreachChannel } from '@/entities/outreach-message/types';
import { OUTREACH_CHANNEL_LABELS } from '@/entities/outreach-message/types';
import { OutreachBlockedError } from '@/features/job-offer/api/job-offer.api';
import { useOutreach } from '@/features/job-offer/hooks/use-outreach';
import { CHANNEL_BUDGETS } from '@/shared/ai/outreach-validator';
import { Button } from '@/shared/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Heading, Label, Spinner, Text } from '@/shared/ui/primitives';

const CHANNEL_ORDER: OutreachChannel[] = [
  'CONNECTION_NOTE',
  'DIRECT_MESSAGE',
  'EMAIL',
];

export function OutreachPanel({ offerId }: { offerId: string }) {
  const [contactName, setContactName] = useState('');
  const [contactUrl, setContactUrl] = useState('');
  const [copiedChannel, setCopiedChannel] = useState<OutreachChannel | null>(
    null,
  );
  const mutation = useOutreach();

  const blocked =
    mutation.error instanceof OutreachBlockedError ? mutation.error : null;
  const messagesByChannel = new Map(
    (mutation.data?.messages ?? []).map((message) => [
      message.channel,
      message,
    ]),
  );

  async function handleCopy(channel: OutreachChannel, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedChannel(channel);
      setTimeout(
        () =>
          setCopiedChannel((current) => (current === channel ? null : current)),
        2000,
      );
    } catch {
      // clipboard write failed; leave button state unchanged
    }
  }

  function handleGenerate() {
    // No early return on a blank name - the server is the source of truth
    // for "no contact on file" (NoOutreachContactError) and its 422 is what
    // drives the posting-URL fallback below; short-circuiting here made
    // that branch unreachable.
    mutation.mutate({
      id: offerId,
      contact: {
        name: contactName.trim(),
        profileUrl: contactUrl.trim() || undefined,
      },
    });
  }

  return (
    <section className="flex flex-col gap-3">
      <Heading level={4} as="h2">
        Outreach
      </Heading>
      <Text size="sm" color="muted">
        Nothing here is ever sent automatically - every draft is yours to review
        and send.
      </Text>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="outreach-contact-name">
            Contact&apos;s first name
          </Label>
          <Input
            id="outreach-contact-name"
            value={contactName}
            onChange={(event) => setContactName(event.target.value)}
            placeholder="e.g. Jane"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="outreach-contact-url">LinkedIn URL (optional)</Label>
          <Input
            id="outreach-contact-url"
            value={contactUrl}
            onChange={(event) => setContactUrl(event.target.value)}
            placeholder="https://linkedin.com/in/..."
          />
        </div>
        <Button
          variant="secondary"
          className="self-start"
          disabled={mutation.isPending}
          onClick={handleGenerate}
        >
          {mutation.isPending && <Spinner size="sm" />}
          {mutation.isPending ? 'Drafting…' : 'Draft outreach'}
        </Button>
      </div>

      {blocked && (
        <Text size="sm" color="muted">
          {blocked.message}
          {blocked.postingUrl && (
            <>
              {' '}
              <a
                href={blocked.postingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                View the posting
              </a>
            </>
          )}
        </Text>
      )}

      {mutation.isSuccess && (
        <div className="flex flex-col gap-4">
          {CHANNEL_ORDER.map((channel) => {
            const message = messagesByChannel.get(channel);
            if (!message) return null;
            const budget = CHANNEL_BUDGETS[channel];
            const overBudget = message.body.length > budget.hardMax;

            return (
              <Card key={channel} size="sm">
                <CardHeader>
                  <CardTitle className="text-base">
                    {OUTREACH_CHANNEL_LABELS[channel]}
                  </CardTitle>
                  <CardAction>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleCopy(
                          channel,
                          message.subject
                            ? `${message.subject}\n\n${message.body}`
                            : message.body,
                        )
                      }
                    >
                      {copiedChannel === channel ? 'Copied!' : 'Copy'}
                    </Button>
                  </CardAction>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  {message.subject && (
                    <p className="text-sm font-medium">{message.subject}</p>
                  )}
                  <p className="whitespace-pre-wrap text-sm">{message.body}</p>
                  <Text color={overBudget ? 'destructive' : 'muted'} size="sm">
                    {message.body.length} / {budget.hardMax} characters
                  </Text>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
