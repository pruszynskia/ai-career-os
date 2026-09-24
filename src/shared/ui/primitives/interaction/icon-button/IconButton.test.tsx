import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { IconButton } from './IconButton';

describe('IconButton', () => {
  it('does not render a warning dot by default', () => {
    const html = renderToStaticMarkup(
      <IconButton aria-label="Notifications">
        <svg />
      </IconButton>,
    );
    expect(html).not.toContain('data-slot="warning-dot"');
  });

  it('renders the warning dot when warningDot is set', () => {
    const html = renderToStaticMarkup(
      <IconButton aria-label="Notifications" warningDot>
        <svg />
      </IconButton>,
    );
    const dot = html.match(/<span[^>]*data-slot="warning-dot"[^>]*>/)?.[0];
    expect(dot).toBeDefined();
    expect(dot).toContain('aria-hidden="true"');
    expect(dot).toContain('bg-warning');
    expect(dot).toContain('ring-2');
  });

  it('passes a single child through asChild without warningDot (Slot requires exactly one)', () => {
    // Regression guard: {children}{warningDot && ...} always produced an
    // array of children, which breaks Radix Slot's Children.only check
    // even when warningDot is false.
    expect(() =>
      renderToStaticMarkup(
        <IconButton aria-label="Notifications" asChild>
          <a href="/notifications">
            <svg />
          </a>
        </IconButton>,
      ),
    ).not.toThrow();
  });
});
