'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import type { OfferSortOption } from '@/entities/job-offer/types';

import {
  OFFER_SORT_LABELS,
  offerSortOptions,
} from '@/entities/job-offer/types';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

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
      <select
        name="sort"
        defaultValue={sort}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        aria-label="Sort offers"
        className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {offerSortOptions.map((option) => (
          <option key={option} value={option}>
            {OFFER_SORT_LABELS[option]}
          </option>
        ))}
      </select>
      <label className="flex items-center gap-1.5 text-sm">
        <input
          type="checkbox"
          name="favorite"
          defaultChecked={favoritesOnly}
          onChange={(event) => event.currentTarget.form?.requestSubmit()}
        />
        Favorites only
      </label>
      <div className="ml-auto flex items-center gap-1" role="group" aria-label="View">
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
