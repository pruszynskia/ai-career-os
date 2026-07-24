'use client';

import type { JobOffer } from '@/entities/job-offer/types';
import { useState } from 'react';

import type { ApplicationBundle } from '@/entities/application/types';
import { ApplicationList } from '@/features/application/components/application-list';
import { useSearchApplications } from '@/features/application/hooks/use-search-applications';
import { OfferList } from '@/features/job-offer/components/offer-list';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

export function CompanySearch({
  initialApplications,
  initialOffers,
}: {
  initialApplications: ApplicationBundle[];
  initialOffers: JobOffer[];
}) {
  const [query, setQuery] = useState('');
  const mutation = useSearchApplications();

  const results = mutation.data ?? {
    applications: initialApplications,
    offers: initialOffers,
  };
  const isEmpty =
    results.applications.length === 0 && results.offers.length === 0;

  return (
    <div className="flex flex-col gap-4">
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          mutation.mutate(query.trim());
        }}
      >
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by position or company…"
          aria-label="Search by position or company"
        />
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Searching…' : 'Search'}
        </Button>
      </form>

      {mutation.isError && (
        <p role="alert" className="text-sm text-destructive">
          {mutation.error.message}
        </p>
      )}

      {isEmpty ? (
        <p className="text-sm text-muted-foreground">
          No matching offers or applications.
        </p>
      ) : (
        <>
          {results.applications.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold">Applications</h2>
              <ApplicationList applications={results.applications} />
            </section>
          )}
          {results.offers.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold">Offers not yet tracked</h2>
              <OfferList offers={results.offers} />
            </section>
          )}
        </>
      )}
    </div>
  );
}
