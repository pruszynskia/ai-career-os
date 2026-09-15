'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useRef } from 'react';

import type { OfferSortOption } from '@/entities/job-offer/types';

import {
  OFFER_SORT_LABELS,
  offerSortOptions,
} from '@/entities/job-offer/types';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/primitives';

export function OfferFilters({
  query,
  sort,
  favoritesOnly,
  view,
}: {
  query: string;
  sort: OfferSortOption;
  favoritesOnly: boolean;
  view: 'list' | 'board';
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);

  function updateParams(patch: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <form
      ref={formRef}
      className="flex flex-wrap items-center gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        updateParams({
          q: (formData.get('q') as string).trim(),
          sort: formData.get('sort') as string,
          favorite: formData.get('favorite') ? '1' : undefined,
        });
      }}
    >
      <Input
        name="q"
        defaultValue={query}
        placeholder="Search by title or company…"
        aria-label="Search by title or company"
        className="max-w-xs"
      />
      <Select
        name="sort"
        defaultValue={sort}
        onValueChange={(value) => updateParams({ sort: value })}
      >
        <SelectTrigger aria-label="Sort offers">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {offerSortOptions.map((option) => (
            <SelectItem key={option} value={option}>
              {OFFER_SORT_LABELS[option]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <label className="flex items-center gap-1.5 text-sm">
        <input
          type="checkbox"
          name="favorite"
          defaultChecked={favoritesOnly}
          onChange={(event) => event.currentTarget.form?.requestSubmit()}
        />
        Favorites only
      </label>
      <div
        className="ml-auto flex items-center gap-1"
        role="group"
        aria-label="View"
      >
        <Button
          type="button"
          size="sm"
          variant={view === 'list' ? 'default' : 'outline'}
          aria-pressed={view === 'list'}
          onClick={() => updateParams({ view: undefined })}
        >
          List
        </Button>
        <Button
          type="button"
          size="sm"
          variant={view === 'board' ? 'default' : 'outline'}
          aria-pressed={view === 'board'}
          onClick={() => updateParams({ view: 'board' })}
        >
          Board
        </Button>
      </div>
    </form>
  );
}
