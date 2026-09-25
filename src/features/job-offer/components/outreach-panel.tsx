'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import type { OutreachChannel } from '@/entities/outreach-message/types';
import { OUTREACH_CHANNEL_LABELS } from '@/entities/outreach-message/types';
import {
  EntitlementRequiredError,
  OutreachBlockedError,
} from '@/features/job-offer/api/job-offer.api';
import { useDraftFollowUp } from '@/features/job-offer/hooks/use-draft-follow-up';
import { useMarkOutreachSent } from '@/features/job-offer/hooks/use-mark-outreach-sent';
import { useOutreach } from '@/features/job-offer/hooks/use-outreach';
import { CHANNEL_BUDGETS } from '@/shared/ai/outreach-validator';
import { Banner } from '@/shared/ui/banner';
import { Button } from '@/shared/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { Input } from '@/shared/ui/input';
import { Grid, Heading, Label, Spinner, Text } from '@/shared/ui/primitives';

const CHANNEL_ORDER: OutreachChannel[] = [
  'CONNECTION_NOTE',
  'DIRECT_MESSAGE',
  'EMAIL',
];

// interlockWarning/selectedContact carry no dependency on the contact
// feature's own types - job-offer and contact are isolated feature slices
// (ADR-008), so OfferDetail (which composes both) passes this panel plain
// data rather than either feature importing the other.
export function OutreachPanel({
  offerId,
  selectedContact,
  interlockWarning,
}: {
  offerId: string;
  selectedContact?: { name: string; profileUrl: string | null } | null;
  interlockWarning?: { contactName: string; messagedAt: Date } | null;
}) {
  const [contactName, setContactName] = useState('');
  const [contactUrl, setContactUrl] = useState('');
  // Keyed by message id, not channel: the follow-up card and the original
  // card for the same channel are two different messages, and keying on
  // channel flipped both buttons to "Copied!" when only one was clicked.
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  // Tracks which selection last synced the fields below, so a new pick in
  // the who-you-know panel (TASK-084) pre-fills them exactly once - not on
  // every render, and without an effect (React's own guidance: adjust state
  // during render, not in a setState-in-effect that triggers a second
  // render). The name/URL stay plain editable state after that, so the
  // user can still hand-type or tweak them.
  const [syncedContact, setSyncedContact] = useState(selectedContact ?? null);
  if (selectedContact && selectedContact !== syncedContact) {
    setSyncedContact(selectedContact);
    setContactName(selectedContact.name);
    setContactUrl(selectedContact.profileUrl ?? '');
  }
  const mutation = useOutreach();
  const followUpMutation = useDraftFollowUp();
  const markSentMutation = useMarkOutreachSent();

  // The follow-up nudge (TASK-086) links here as /offers/{id}?followUp=1 -
  // drafting itself is the notification's "one action", so it fires once
  // on arrival rather than needing a second click in this panel.
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const triggeredFollowUp = useRef(false);
  useEffect(() => {
    if (searchParams.get('followUp') !== '1' || triggeredFollowUp.current) {
      return;
    }
    triggeredFollowUp.current = true;
    followUpMutation.mutate(offerId);
    // Strip the param immediately so a refresh, back-navigation or re-share
    // of this URL never re-fires the (metered) generation a second time -
    // the ref guard above only protects this mount.
    const params = new URLSearchParams(searchParams);
    params.delete('followUp');
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
    // followUpMutation is a new object every render (useMutation's
    // identity), so it's deliberately left out of the deps array - the
    // triggeredFollowUp ref is what guards this to a single call.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, offerId, pathname, router]);

  const blocked =
    mutation.error instanceof OutreachBlockedError ? mutation.error : null;
  const gated =
    mutation.error instanceof EntitlementRequiredError
      ? mutation.error
      : followUpMutation.error instanceof EntitlementRequiredError
        ? followUpMutation.error
        : null;
  const messagesByChannel = new Map(
    (mutation.data?.messages ?? []).map((message) => [
      message.channel,
      message,
    ]),
  );
  // Only a warning once a contact is actually addressed, and only when that
  // contact differs from the one the interlock already flagged -
  // re-messaging the same person isn't "a second contact at this company"
  // (do_not: never a hard block either). Without the non-empty check this
  // fired on page load before any contact was picked, since '' never
  // matches the flagged name.
  const trimmedContactName = contactName.trim();
  const showInterlockWarning =
    interlockWarning &&
    trimmedContactName.length > 0 &&
    interlockWarning.contactName.trim().toLowerCase() !==
      trimmedContactName.toLowerCase();

  async function handleCopy(text: string, messageId: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(
        () =>
          setCopiedMessageId((current) =>
            current === messageId ? null : current,
          ),
        2000,
      );
      // Copying a draft out to send it is the closest signal the app gets
      // that it was actually sent, on any channel - not just the
      // CONNECTION_NOTE case this started as. A follow-up (TASK-086) needs
      // to know which of the three channel drafts was actually used, and
      // findLatestByJobOffer prefers a SENT row for exactly that; best-
      // effort, no UI feedback, never blocks the copy itself.
      markSentMutation.mutate({ offerId, messageId });
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
          variant="primary"
          className="self-start"
          disabled={mutation.isPending}
          onClick={handleGenerate}
        >
          {mutation.isPending && <Spinner size="sm" />}
          {mutation.isPending ? 'Drafting…' : 'Draft outreach'}
        </Button>
      </div>

      {showInterlockWarning && interlockWarning && (
        <Banner tone="warning">
          {interlockWarning.contactName} at this company was already messaged on{' '}
          {interlockWarning.messagedAt.toLocaleDateString()} - contacting a
          second person here within 30 days may look like spam. This is only a
          warning; nothing is blocked.
        </Banner>
      )}

      {gated && (
        <EmptyState
          message={gated.message}
          action={
            <Button asChild size="sm">
              <Link href={gated.upgradePath}>Upgrade to Pro</Link>
            </Button>
          }
        />
      )}

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
        <Grid cols={1} colsMd={3} gap={4}>
          {CHANNEL_ORDER.map((channel) => {
            const message = messagesByChannel.get(channel);
            if (!message) return null;
            const budget = CHANNEL_BUDGETS[channel];
            const overBudget = message.body.length > budget.hardMax;
            const markedThisMessage =
              markSentMutation.isSuccess &&
              markSentMutation.variables?.messageId === message.id;

            return (
              <Card key={channel} size="sm">
                <CardHeader>
                  <CardTitle>{OUTREACH_CHANNEL_LABELS[channel]}</CardTitle>
                  <CardAction>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        handleCopy(
                          message.subject
                            ? `${message.subject}\n\n${message.body}`
                            : message.body,
                          message.id,
                        )
                      }
                    >
                      {copiedMessageId === message.id ? 'Copied!' : 'Copy'}
                    </Button>
                  </CardAction>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  {message.subject && (
                    <p className="text-sm font-medium">{message.subject}</p>
                  )}
                  <p className="whitespace-pre-wrap text-sm">
                    {message.body}
                  </p>
                </CardContent>
                <CardFooter className="justify-between bg-transparent">
                  <Text color={overBudget ? 'destructive' : 'muted'} size="sm">
                    {message.body.length} / {budget.hardMax} characters
                  </Text>
                  <Button
                    variant="quiet"
                    size="sm"
                    onClick={() =>
                      markSentMutation.mutate({ offerId, messageId: message.id })
                    }
                  >
                    {markedThisMessage ? 'Marked as sent' : 'Mark as sent'}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </Grid>
      )}

      {followUpMutation.isPending && (
        <Text size="sm" color="muted">
          Drafting a follow-up…
        </Text>
      )}

      {followUpMutation.isSuccess && (
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-base">
              Follow-up (
              {OUTREACH_CHANNEL_LABELS[followUpMutation.data.message.channel]})
            </CardTitle>
            <CardAction>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  handleCopy(
                    followUpMutation.data.message.subject
                      ? `${followUpMutation.data.message.subject}\n\n${followUpMutation.data.message.body}`
                      : followUpMutation.data.message.body,
                    followUpMutation.data.message.id,
                  )
                }
              >
                {copiedMessageId === followUpMutation.data.message.id
                  ? 'Copied!'
                  : 'Copy'}
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {followUpMutation.data.message.subject && (
              <p className="text-sm font-medium">
                {followUpMutation.data.message.subject}
              </p>
            )}
            <p className="whitespace-pre-wrap text-sm">
              {followUpMutation.data.message.body}
            </p>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
