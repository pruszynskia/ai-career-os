import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { SegmentedControl, SegmentedControlItem } from './segmented-control';

describe('SegmentedControl', () => {
  it('marks the selected item via data-state=on', () => {
    const html = renderToStaticMarkup(
      <SegmentedControl value="b" onValueChange={() => {}}>
        <SegmentedControlItem value="a">A</SegmentedControlItem>
        <SegmentedControlItem value="b">B</SegmentedControlItem>
      </SegmentedControl>,
    );
    expect(html).toMatch(/data-state="off"[^>]*>A<\/button>/);
    expect(html).toMatch(/data-state="on"[^>]*>B<\/button>/);
  });

  it('derives item height from the track size without a separate item size prop', () => {
    const html = renderToStaticMarkup(
      <SegmentedControl size="md" value="a" onValueChange={() => {}}>
        <SegmentedControlItem value="a">A</SegmentedControlItem>
      </SegmentedControl>,
    );
    expect(html).toContain('data-size="md"');
    // item's height class targets ancestors with data-size="md" - it never
    // needs `size` passed on the item itself.
    expect(html).toMatch(/\[\[data-size=md\]_&amp;\]:h-\[26px\]/);
  });
});
