'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Label, Spinner, Text, VStack } from '@/shared/ui/primitives';

const CONFIRM_WORD = 'DELETE';

export function DangerZone() {
  const router = useRouter();
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    setIsExporting(true);
    setError(null);
    try {
      const response = await fetch('/api/account/export');
      if (!response.ok) throw new Error('Failed to export account data.');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'account-export.json';
      link.click();
      // Revoke on the next tick — revoking synchronously can abort the
      // download in some browsers before it has started reading the blob.
      setTimeout(() => URL.revokeObjectURL(url), 0);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Failed to export account data.',
      );
    } finally {
      setIsExporting(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);
    try {
      const response = await fetch('/api/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: CONFIRM_WORD }),
      });
      const body = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;

      if (!response.ok) {
        throw new Error(body?.message ?? 'Failed to delete the account.');
      }

      router.push('/sign-in');
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Failed to delete the account.',
      );
      setIsDeleting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Danger zone</CardTitle>
      </CardHeader>
      <CardContent>
        <VStack gap={4}>
          <VStack gap={2}>
            <Text>Export your data</Text>
            <Text color="muted">
              Download a JSON file of everything this account owns.
            </Text>
            <Button
              type="button"
              variant="outline"
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? 'Preparing…' : 'Export data'}
            </Button>
          </VStack>

          <VStack gap={2}>
            <Text>Delete account</Text>
            <Text color="muted">
              Cancels any active subscription and permanently removes this
              account and all of its data. This cannot be undone.
            </Text>
            <Dialog
              open={isOpen}
              onOpenChange={(open) => {
                setIsOpen(open);
                if (!open) setConfirmText('');
              }}
            >
              <DialogTrigger asChild>
                <Button type="button" variant="destructive">
                  Delete account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete your account?</DialogTitle>
                  <DialogDescription>
                    This permanently deletes your profile, offers, documents,
                    applications, posts and subscription. Type {CONFIRM_WORD} to
                    confirm.
                  </DialogDescription>
                </DialogHeader>
                <VStack gap={2}>
                  <Label htmlFor="delete-confirm">
                    Type {CONFIRM_WORD} to confirm
                  </Label>
                  <Input
                    id="delete-confirm"
                    value={confirmText}
                    onChange={(event) => setConfirmText(event.target.value)}
                    autoComplete="off"
                  />
                </VStack>
                <DialogFooter showCloseButton>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={confirmText !== CONFIRM_WORD || isDeleting}
                  >
                    {isDeleting && <Spinner size="sm" />}
                    {isDeleting ? 'Deleting…' : 'Delete account'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </VStack>

          {error ? <Text color="destructive">{error}</Text> : null}
        </VStack>
      </CardContent>
    </Card>
  );
}
