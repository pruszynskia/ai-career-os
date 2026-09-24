import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { Meter } from './meter';

describe('Meter', () => {
  it('exposes role="meter" with aria-value* only in standalone mode', () => {
    const inline = renderToStaticMarkup(<Meter value={50} />);
    expect(inline).not.toContain('role="meter"');

    const standalone = renderToStaticMarkup(
      <Meter variant="standalone" value={50} max={100} aria-label="Usage" />,
    );
    expect(standalone).toContain('role="meter"');
    expect(standalone).toContain('aria-valuenow="50"');
    expect(standalone).toContain('aria-valuemin="0"');
    expect(standalone).toContain('aria-valuemax="100"');
  });

  it('does not expose the meter role in segmented mode', () => {
    const html = renderToStaticMarkup(
      <Meter
        variant="standalone"
        segments={[
          { value: 30, colorVar: 'var(--tier-1)' },
          { value: 20, colorVar: 'var(--tier-2)' },
        ]}
      />,
    );
    expect(html).not.toContain('role="meter"');
  });
});
