import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { RecommendedActionBadge } from './recommended-action-badge';

describe('RecommendedActionBadge', () => {
  it('renders a TierMarker with the action label, not a coloured Badge', () => {
    const html = renderToStaticMarkup(
      <RecommendedActionBadge action="APPLY_IMMEDIATELY" />,
    );
    expect(html).toContain('data-slot="tier-marker"');
    expect(html).toContain('Apply immediately');
    expect(html).not.toContain('data-slot="tag"');
    expect(html).not.toContain('data-slot="badge"');
  });
});
