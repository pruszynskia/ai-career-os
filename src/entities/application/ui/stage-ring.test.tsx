import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { StageRing } from './stage-ring';

function dashOffset(html: string): string | undefined {
  return html.match(/stroke-dashoffset="([^"]+)"/)?.[1];
}

describe('StageRing', () => {
  it('renders a visibly different arc for each active stage index', () => {
    const offsets = (
      ['APPLIED', 'HR', 'TECHNICAL', 'TEAM', 'CEO_OR_MANAGER'] as const
    ).map((status) =>
      dashOffset(renderToStaticMarkup(<StageRing status={status} />)),
    );
    expect(new Set(offsets).size).toBe(offsets.length);
  });

  it('renders a dashed ring with no status for not-tracked', () => {
    const html = renderToStaticMarkup(<StageRing status={null} />);
    expect(html).toContain('data-state="not-tracked"');
    expect(html).toContain('stroke-dasharray="1.5 1.5"');
  });

  it('renders a filled accent ring with a check for Offer', () => {
    const html = renderToStaticMarkup(<StageRing status="OFFER" />);
    expect(html).toContain('data-state="offer"');
    expect(html).toContain('fill="var(--primary)"');
  });

  it.each(['REJECTED', 'NO_RESPONSE', 'EXPIRED'] as const)(
    'renders a filled border-default ring with a dash for %s',
    (status) => {
      const html = renderToStaticMarkup(<StageRing status={status} />);
      expect(html).toContain('data-state="closed"');
      expect(html).toContain('fill="var(--border-default)"');
    },
  );

  it('is aria-hidden', () => {
    const html = renderToStaticMarkup(<StageRing status="APPLIED" />);
    expect(html).toContain('aria-hidden="true"');
  });
});
