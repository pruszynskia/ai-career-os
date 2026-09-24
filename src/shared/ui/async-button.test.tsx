import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { AsyncButton } from './async-button';

// Width is set by the widest layer; both states must lay out the same
// content (one layer merely hidden), so the box cannot change size.
// Strips only what legitimately differs: which layer is hidden, and disabled.
const layout = (html: string) =>
  html.replace(/ (aria-hidden="true"|class="[^"]*"|disabled="")/g, '');

describe('AsyncButton', () => {
  it('renders identical width-setting content at rest and pending', () => {
    const rest = renderToStaticMarkup(
      <AsyncButton pendingLabel="Deleting…">Delete</AsyncButton>,
    );
    const pending = renderToStaticMarkup(
      <AsyncButton pending pendingLabel="Deleting…">
        Delete
      </AsyncButton>,
    );
    expect(rest).toContain('Deleting…');
    expect(pending).toContain('Delete<');
    expect(layout(rest)).toBe(layout(pending));
  });
});
