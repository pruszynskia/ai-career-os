'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useRef } from 'react';

import type { OfferSortOption } from '@/entities/job-offer/types';

import {
  OFFER_SORT_LABELS,
  offerSortOptions,
} from '@/entities/job-offer/types';
import { Input } from '@/shared/ui/input';
import {
  Select,
  SegmentedControl,
  SegmentedControlItem,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tag,
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
      {/* This checkbox is the toolbar's only filter criterion today (fit/
          company/status filters have no UI anywhere yet) - it fills the
          "filter" toolbar slot rather than a placeholder popover with
          nothing to filter by. */}
      <label className="flex items-center gap-1.5 text-sm">
        <input
          type="checkbox"
          name="favorite"
          defaultChecked={favoritesOnly}
          onChange={(event) => event.currentTarget.form?.requestSubmit()}
        />
        Favorites only
      </label>
      {/* Grouping is fixed to fit tier (RecommendedAction) - GridTable has
          no other grouping mode to switch to yet, so this is a status
          readout rather than a control (do not invent a second tiering
          scheme just to make it interactive). */}
      <Tag>
        Group:{' '}
        <span className="font-medium text-foreground">Recommendation</span>
      </Tag>
      <span className="ml-auto" />
      <SegmentedControl
        value={view}
        onValueChange={(value) =>
          updateParams({ view: value === 'board' ? 'board' : undefined })
        }
        aria-label="View"
      >
        <SegmentedControlItem value="list">List</SegmentedControlItem>
        <SegmentedControlItem value="board">Board</SegmentedControlItem>
      </SegmentedControl>
    </form>
  );
}
