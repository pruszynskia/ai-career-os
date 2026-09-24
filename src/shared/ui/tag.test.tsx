import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { Tag, tagVariants } from './tag';

describe('Tag', () => {
  it('has no coloured background variant left', () => {
    const html = renderToStaticMarkup(<Tag>Remote</Tag>);
    expect(html).not.toMatch(/bg-(success|warning|destructive|info)/);
    expect(tagVariants({ size: 'sm' })).not.toMatch(
      /bg-(success|warning|destructive|info)/,
    );
  });

  it('renders the selected state via aria-pressed', () => {
    const html = renderToStaticMarkup(<Tag aria-pressed>Remote</Tag>);
    expect(html).toContain('aria-pressed="true"');
  });
});
