import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { GridTable, GridTableGroupHeader, GridTableRow } from './grid-table';

describe('GridTable', () => {
  it('renders TierMarker (not a hand-rolled square) inside GroupHeader', () => {
    const html = renderToStaticMarkup(
      <GridTable columns="1fr 100px">
        <GridTableGroupHeader tier={2} label="Consider" count={5} />
      </GridTable>,
    );
    expect(html).toContain('data-slot="tier-marker"');
    expect(html).toContain('Consider');
  });

  it('reflects the collapsed prop via aria-expanded', () => {
    const html = renderToStaticMarkup(
      <GridTableGroupHeader tier={null} label="Ignore" count={2} collapsed />,
    );
    expect(html).toContain('aria-expanded="false"');
  });

  it('marks a selected row via data-selected', () => {
    const html = renderToStaticMarkup(
      <GridTableRow selected>
        <span>Cell</span>
      </GridTableRow>,
    );
    expect(html).toContain('data-selected="true"');
  });
});
