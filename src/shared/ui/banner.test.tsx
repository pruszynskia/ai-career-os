import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { Banner } from './banner';

describe('Banner', () => {
  it.each(['warning', 'danger'] as const)(
    'renders role="alert" for the %s tone',
    (tone) => {
      const html = renderToStaticMarkup(<Banner tone={tone}>Heads up</Banner>);
      expect(html).toContain('role="alert"');
    },
  );

  it.each(['neutral', 'success'] as const)(
    'renders role="status" for the %s tone',
    (tone) => {
      const html = renderToStaticMarkup(<Banner tone={tone}>All good</Banner>);
      expect(html).toContain('role="status"');
    },
  );
});
