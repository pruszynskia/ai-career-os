'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Briefcase,
  FileText,
  LayoutDashboard,
  Rss,
  type LucideIcon,
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { SectionLabel } from '@/shared/ui/primitives';
import {
  searchJumpTargets,
  type JumpTargets,
} from '@/features/job-offer/services/search-jump-targets.service';

interface JumpPage {
  href: string;
  label: string;
  icon: LucideIcon;
}

// Same four Views as the sidebar's own nav (TASK-100) - kept local rather
// than imported from sidebar.tsx to avoid a circular import (sidebar opens
// this dialog).
const PAGES: JumpPage[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/offers', label: 'Offers', icon: Briefcase },
  { href: '/documents', label: 'Documents', icon: FileText },
  { href: '/posts', label: 'Posts', icon: Rss },
];

const EMPTY_RESULTS: JumpTargets = { offers: [], companies: [] };

interface JumpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JumpDialog({ open, onOpenChange }: JumpDialogProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<JumpTargets>(EMPTY_RESULTS);
  const trimmedQuery = query.trim();
  const visibleResults = trimmedQuery ? results : EMPTY_RESULTS;

  useEffect(() => {
    if (!trimmedQuery) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      searchJumpTargets(trimmedQuery).then((targets) => {
        if (!cancelled) setResults(targets);
      });
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [trimmedQuery]);

  function handleOpenChange(nextOpen: boolean) {
    // Reset so reopening never shows the previous search.
    if (!nextOpen) {
      setQuery('');
      setResults(EMPTY_RESULTS);
    }
    onOpenChange(nextOpen);
  }

  function goTo(href: string) {
    router.push(href);
    handleOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Search or jump to…</DialogTitle>
        </DialogHeader>

        <Input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search offers, companies, or pages…"
          aria-label="Search offers, companies, or pages"
        />

        <div className="flex max-h-[50vh] flex-col gap-3 overflow-y-auto">
          <div>
            <SectionLabel id="jump-pages">Pages</SectionLabel>
            <ul
              aria-labelledby="jump-pages"
              className="mt-1 flex flex-col gap-0.5"
            >
              {PAGES.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <button
                    type="button"
                    onClick={() => goTo(href)}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-muted"
                  >
                    <Icon
                      aria-hidden="true"
                      className="size-4 shrink-0 text-muted-foreground"
                    />
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {visibleResults.offers.length > 0 && (
            <div>
              <SectionLabel id="jump-offers">Offers</SectionLabel>
              <ul
                aria-labelledby="jump-offers"
                className="mt-1 flex flex-col gap-0.5"
              >
                {visibleResults.offers.map((offer) => (
                  <li key={offer.id}>
                    <button
                      type="button"
                      onClick={() => goTo(`/offers/${offer.id}`)}
                      className="flex w-full flex-col items-start rounded-lg px-2 py-1.5 text-left text-sm hover:bg-muted"
                    >
                      <span className="truncate">{offer.title}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {offer.company}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {visibleResults.companies.length > 0 && (
            <div>
              <SectionLabel id="jump-companies">Companies</SectionLabel>
              <ul
                aria-labelledby="jump-companies"
                className="mt-1 flex flex-col gap-0.5"
              >
                {visibleResults.companies.map((company) => (
                  <li key={company}>
                    <button
                      type="button"
                      onClick={() =>
                        goTo(`/offers?q=${encodeURIComponent(company)}`)
                      }
                      className="flex w-full items-center rounded-lg px-2 py-1.5 text-left text-sm hover:bg-muted"
                    >
                      {company}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
