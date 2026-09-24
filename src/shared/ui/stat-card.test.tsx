import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { StatCard } from './stat-card';

describe('StatCard', () => {
  it('renders label/value with no Surface or bordered wrapper', () => {
    const html = renderToStaticMarkup(<StatCard label="Applications" value={42} />);

    expect(html).not.toContain('data-slot="surface"');
    expect(html).not.toMatch(/class="[^"]*\bborder\b/);
    expect(html).toContain('Applications');
    expect(html).toContain('42');
  });
});
