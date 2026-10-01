import { TierMarker } from '@/entities/job-offer/ui/tier-marker';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import {
  GridTable,
  GridTableHead,
  GridTableRow,
  gridTableNumericCellClassName,
} from '@/shared/ui/grid-table';
import { Meter } from '@/shared/ui/primitives';

// Static stand-in for the real offers list (src/widgets/unified-offer-list),
// built from the same GridTable/TierMarker/Meter primitives with literal
// sample data - never the live widget, which fetches and mutates via
// react-query and would pull data-fetching into a static marketing page.
const SAMPLE_OFFERS = [
  {
    company: 'Brightwave',
    title: 'Senior Frontend Engineer',
    tier: 1 as const,
    match: 88,
    callback: 70,
  },
  {
    company: 'Northwind Analytics',
    title: 'Staff Frontend Engineer',
    tier: 2 as const,
    match: 76,
    callback: 54,
  },
  {
    company: 'Solstice Health',
    title: 'Frontend Engineer',
    tier: 3 as const,
    match: 61,
    callback: 38,
  },
];

const COLUMNS = 'minmax(0,1fr) 110px 90px';

export function OffersFrame() {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Offers, ranked</CardTitle>
      </CardHeader>
      <CardContent className="px-0 pt-0 pb-0">
        <GridTable columns={COLUMNS}>
          <GridTableHead>
            <span>Offer</span>
            <span>Match</span>
            <span className={gridTableNumericCellClassName}>Callback</span>
          </GridTableHead>
          {SAMPLE_OFFERS.map((offer) => (
            <GridTableRow key={offer.company}>
              <TierMarker tier={offer.tier} className="min-w-0">
                <span className="block truncate">
                  {offer.title}
                  <span className="ml-1.5 text-muted-foreground">
                    {offer.company}
                  </span>
                </span>
              </TierMarker>
              <div className="flex items-center gap-2">
                <Meter variant="inline" value={offer.match} className="w-12" />
                <span className={gridTableNumericCellClassName}>
                  {offer.match}
                </span>
              </div>
              <span className={gridTableNumericCellClassName}>
                {offer.callback}%
              </span>
            </GridTableRow>
          ))}
        </GridTable>
      </CardContent>
    </Card>
  );
}
